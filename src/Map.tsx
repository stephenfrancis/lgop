
import * as React from "react";
import * as Uuidv4 from "uuid/v4";
import RootLog from "loglevel";
import Block from "./Block";
import Direction from "./Direction";
import Point from "./Point";
// import Draw from "./Draw";

const Log = RootLog.getLogger("lgop.Map");


export default class Map {
  private first_location: Location;
  private id: string;
  private title: string;

  constructor(id: string, content: string) {
    this.id = id;
    Location.clear();
    Cell.clear();
    this.parseContent(content);
    Cell.report();
  }


  public getFirstLocation(): Location {
    return this.first_location;
  }


  public getSVG(): JSX.Element {
    return (
      <svg height="800" version="1.1" width="1200" xmlns="http://www.w3.org/2000/svg">
        {this.first_location.draw()}
      </svg>
    );
  }


  public getTitle(): string {
    return this.title;
  }


  private isDirection(line: string, parse_state: any): boolean {
    let match = line.match(/^ {2}\* (N|NE|E|SE|S|SW|W|NW|U|D):(.*)$/);
    if (match && match.length > 2 && parse_state.location) {
      parse_state.location.addDirection(match[1], match[2]);
      return true;
    }
    match = line.match(/^ {2}\* C:\s*\[(.*?)\]\((.*)\)$/);
    if (match && match.length > 2 && parse_state.location) {
      parse_state.location.addLink(match[2], match[1]);
    }
    return false;
  }


  private isLocation(line: string, parse_state: any): boolean {
    let match = line.match(/^\* (.*)$/);
    if (match && match.length > 1) {
      parse_state.location = Location.getLocation(match[1]);
      if (!this.first_location) {
        this.first_location = parse_state.location;
        this.first_location.setPosition(0, 0, 0);
      }
      return true;
    }
    return false;
  }

  private isTitle(line: string, parse_state: any): boolean {
    const match = line.match(/^# (.*)/);
    if (match) {
      this.title = match[1];
    }
    return !!match;
  }


  private parseContent(content: string) {
    const that = this;
    const lines = content.split(/\r\n|\n/);
    const parse_state = {
      inside_room: false,
    }
    lines.forEach(function (line) {
      let done = false;
      done = done || that.isDirection(line, parse_state);
      done = done || that.isLocation(line, parse_state);
      done = done || that.isTitle(line, parse_state);
      if (!done) {
        that.reportError("unused line: " + line);
      }
    });
  }


  private reportError(str: string): void {
    console.log(this.id + ": " + str); // eslint-disable-line no-console
  }

}


export class Location {
  private block: Block;
  private col: number;
  private directions: { [index: string]: Location, };
  private elmt_id: string;
  private positioned: boolean = false;
  private row: number;
  private z: number;
  private static locations: { [index: string]: Location, } = {};


  constructor(name: string) {
    this.block = new Block(name);
    this.directions = {};
    this.elmt_id = Uuidv4();
  }


  public addDirection(direction: string, other_location: string): void {
    const dir: Direction = Direction.get(direction);
    if (!dir) {
      throw new Error(`invalid direction code: ${direction}`);
    }
    if (this.directions[direction]) {
      throw new Error(`direction already specified: ${direction}`);
    }
    this.directions[direction] = Location.getLocation(other_location);
    this.block.addConnector(this.directions[direction].block, dir);
    this.positionRelativeIfNecessary(direction);
  }


  public addLink(link_url: string, link_text?: string): void {
    this.block.setLink(link_url, link_text);
  }


  public draw(done_locations?): JSX.Element {
    done_locations = done_locations || [];
    if (done_locations.indexOf(this) > -1) {
      return null;
    }
    this.setBlockCoordinates();
    const content: Array<JSX.Element> = [];
    content.push(this.block.svg());
    content.push(this.block.svgText());
    done_locations.push(this);
    Object.keys(this.directions).forEach(dir => {
      content.push(this.directions[dir].draw(done_locations));
    });
    content.push(this.block.svgConnectors());
    return (
      <g key={this.elmt_id}>{content}</g>
    );
  }


  public checkPositioned(): void {
    if (!this.positioned) {
      throw new Error(`location not positioned: ${this.getId()}`);
    }
  }


  public static clear(): void {
    Location.locations = {};
  }


  public getDirection(direction: string): Location {
    if (!this.directions[direction]) {
      throw new Error(`no location in this direction: ${direction}`);
    }
    return this.directions[direction];
  }


  public getDirections(): { [index: string]: Location, } {
    return this.directions;
  }


  public getId(): string {
    return this.block.getName().replace(/\s+/g, "_").toLowerCase();
  }


  public static getLocation(name: string): Location {
    name = name.trim();
    if (!Location.locations[name]) {
      Location.locations[name] = new Location(name);
    }
    return Location.locations[name];
  }


  private positionRelativeIfNecessary(direction: string): void {
    this.checkPositioned();
    const other_location: Location = this.directions[direction];
    if (!other_location.positioned) {
      const d: Direction = Direction.get(direction);
      if (d) {
        other_location.setPosition(
          this.col + d.getDeltaCol(),
          this.row + d.getDeltaRow(),
          this.z   + d.getDeltaZ());
      }
    }
  }


  public setBlockCoordinates(): void {
    const point: Point = Cell.getCell(this.row, this.col).getPosition(this.z);
    Log.debug(`setBlockCoords() ${point.getX()}, ${point.getY()}`)
    this.block.getCentre().setX(point.getX());
    this.block.getCentre().setY(point.getY());
  }


  public setPosition(col: number, row: number, z: number): void {
    this.col = col;
    this.row = row;
    this.positioned = true;
    this.z = Cell.getCell(row, col).addLocation(this, z);
  }

}



export class Cell {
  private row: number;
  private col: number;
  private min_z: number;
  private max_z: number;
  private locations: Array<Location>;
  private static cells: Array<Array<Cell>> = [];
  private static min_row: number = 0;
  private static max_row: number = 0;
  private static min_col: number = 0;
  private static max_col: number = 0;

  constructor(row: number, col: number) {
    if (Cell.cells[row][col]) {
      throw new Error(`cell ${row}.${col} already exists`);
    }
    this.row = row;
    this.col = col;
    this.locations = [];
    this.min_z = 0;
    this.max_z = 0;
  }


  public addLocation(location: Location, z: number): number {
    z = this.findBestZ(z);
    this.locations[z] = location;
    this.min_z = Math.min(this.min_z, z);
    this.max_z = Math.max(this.max_z, z);
    return z;
  }


  public static clear(): void {
    Cell.cells = [];
    Cell.min_col = 0;
    Cell.max_col = 0;
    Cell.min_row = 0;
    Cell.max_row = 0;
  }


  public findBestZ(z: number): number {
    while (this.locations[z]) {
      z += 1;
    }
    return z;
  }


  public static getCell(row: number, col: number): Cell {
    if (!Cell.cells[row]) {
      Cell.cells[row] = [];
    }
    if (!Cell.cells[row][col]) {
      Cell.cells[row][col] = new Cell(row, col);
    }
    Cell.min_row = Math.min(Cell.min_row, row);
    Cell.max_row = Math.max(Cell.max_row, row);
    Cell.min_col = Math.min(Cell.min_col, col);
    Cell.max_col = Math.max(Cell.max_col, col);
    return Cell.cells[row][col];
  }


  public static getMaxZInCol(col: number): number {
    let max_z: number = 0;
    for (let row: number = Cell.min_row; row <= Cell.max_row; row += 1) {
      if (Cell.cells[row][col]) {
        max_z = Math.max(max_z, Cell.cells[row][col].max_z);
      }
    }
    return max_z;
  }


  public static getMaxZInRow(row: number): number {
    let max_z: number = 0;
    for (let col: number = Cell.min_col; col <= Cell.max_col; col += 1) {
      if (Cell.cells[row][col]) {
        max_z = Math.max(max_z, Cell.cells[row][col].max_z);
      }
    }
    return max_z;
  }


  public static getMinZInCol(col: number): number {
    let min_z: number = 0;
    for (let row: number = Cell.min_row; row <= Cell.max_row; row += 1) {
      if (Cell.cells[row][col]) {
        min_z = Math.min(min_z, Cell.cells[row][col].min_z);
      }
    }
    return min_z;
  }


  public static getMinZInRow(row: number): number {
    let min_z: number = 0;
    for (let col: number = Cell.min_col; col <= Cell.max_col; col += 1) {
      if (Cell.cells[row][col]) {
        min_z = Math.min(min_z, Cell.cells[row][col].min_z);
      }
    }
    return min_z;
  }


  public getPosition(z?: number): Point {
    let x: number = 120 + (100 * ((z || 0) - Cell.getMinZInCol(this.col)));
    let y: number =  20 + ( 40 * (Cell.getMaxZInRow(this.row) - (z || 0)));
    for (let i = Cell.min_col; i < this.col; i += 1) {
      x += (Cell.getMaxZInCol(i) - Cell.getMinZInCol(i)) * 100 + 150;
    }
    for (let i = Cell.min_row; i < this.row; i += 1) {
      y += (Cell.getMaxZInRow(i) - Cell.getMinZInRow(i)) *  40 +  60;
    }
    return new Point(x, y);
  }


  public static report(): void {

    for (let row: number = Cell.min_row; row <= Cell.max_row; row += 1) {
      for (let col: number = Cell.min_col; col <= Cell.max_col; col += 1) {
        let cell = Cell.cells[row][col];
        if (cell) {
          Log.debug(`cell ${row}, ${col}: ${cell.min_z} - ${cell.max_z}`);
        }
      }
    }

    for (let i = Cell.min_row; i <= Cell.max_row; i += 1) {
      Log.debug(`row ${i} min: ${Cell.getMinZInRow(i)} max: ${Cell.getMaxZInRow(i)}`);
    }
    for (let i = Cell.min_col; i <= Cell.max_col; i += 1) {
      Log.debug(`col ${i} min: ${Cell.getMinZInCol(i)} max: ${Cell.getMaxZInCol(i)}`);
    }

  }

}
