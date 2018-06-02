
import * as React from "react";
import RootLog from "loglevel";
import Draw from "./Draw";

const Log = RootLog.getLogger("lgop.Map");

const direction_codes: any = {
  "N" : { col:  0, row: -1, z:  0, fx:  56, fy:  0, tx:  56, ty: 24, ang:   0, },
  "NE": { col:  1, row: -1, z:  0, fx: 120, fy:  0, tx:   0, ty: 24, ang:  45, },
  "E" : { col:  1, row:  0, z:  0, fx: 120, fy:  8, tx:   0, ty:  8, ang:  90, },
  "SE": { col:  1, row:  1, z:  0, fx: 120, fy: 24, tx:   0, ty:  0, ang: 135, },
  "S" : { col:  0, row:  1, z:  0, fx:  64, fy: 24, tx:  64, ty:  0, ang: 180, },
  "SW": { col: -1, row:  1, z:  0, fx:   0, fy: 24, tx: 120, ty:  0, ang: 225, },
  "W" : { col: -1, row:  0, z:  0, fx:   0, fy: 16, tx: 120, ty: 16, ang: 270, },
  "NW": { col: -1, row: -1, z:  0, fx:   0, fy:  0, tx: 120, ty: 24, ang: 315, },
  "U" : { col:  0, row:  0, z:  1, fx:  96, fy:  0, tx:  16, ty: 24, ang:  45, },
  "D" : { col:  0, row:  0, z: -1, fx:  24, fy: 24, tx: 104, ty:  0, ang: 225, },
};


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
    const draw: Draw = new Draw();
    this.first_location.draw(draw);
    return (
      <svg height="800" version="1.1" width="1200" xmlns="http://www.w3.org/2000/svg">
        {draw.getElements()}
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
  private name: string;
  private directions: any;
  private positioned: boolean = false;
  private height: number = 24;
  private width: number = 120;
  private link_url: string;
  private link_text: string;
  private row: number;
  private col: number;
  private z: number;
  // private x: number;
  // private y: number;
  private static locations: any = {};
  // private static min_row: number = 0;
  // private static min_col: number = 0;
  // private static col_z_extrema = [];
  // private static row_z_extrema = [];


  constructor(name: string) {
    this.name = name;
    this.directions = {};
    Log.debug(`new Location: ${name}`);
  }


  public addDirection(direction: string, other_location: string): void {
    if (!direction_codes[direction]) {
      throw new Error(`invalid direction code: ${direction}`);
    }
    if (this.directions[direction]) {
      throw new Error(`direction already specified: ${direction}`);
    }
    this.directions[direction] = Location.getLocation(other_location);
    this.positionRelativeIfNecessary(direction);
  }


  public addLink(link_url: string, link_text?: string): void {
    this.link_url = link_url;
    this.link_text = link_text;
  }

/*
  public appendLineSVG(elements: Array<JSX.Element>, dir: string, other_location: Location): void {
    const this_pos = this.getPosition();
    const other_pos = other_location.getPosition();
    const key = this.getId() + "_" + other_location.getId();
    const delta = direction_codes[dir];
    const x2 = other_pos.x + delta.tx;
    const y2 = other_pos.y + delta.ty;
    elements.push(
      <line key={key}
        x1={this_pos.x + delta.fx}
        y1={this_pos.y + delta.fy}
        x2={x2}
        y2={y2} />
    );
    const points = `${x2}, ${y2} ${x2 - 3}, ${y2 + 6} ${x2 + 3}, ${y2 + 6}`;
    const transform = `rotate(${delta.ang}, ${x2}, ${y2})`;
    elements.push(
      <polygon key={key + "_arrowhead"} points={points} transform={transform} />
    );
  }
*/

  public draw(draw: Draw, done_locations?): void {
    done_locations = done_locations || [];
    if (done_locations.indexOf(this) > -1) {
      return;
    }
    this.drawBox(draw);
    this.drawText(draw);
    done_locations.push(this);
    let from: any = this.getPosition();
    Object.keys(this.directions).forEach(dir => {
      from.dir = dir;
      this.directions[dir].draw(draw, done_locations);
      // this.appendLineSVG(elements, dir, this.directions[dir]);
      let to: any = this.directions[dir].getPosition();
      to.dir = "auto";
      draw.arrow(from, to);
    });
  }


  public checkPositioned(): void {
    if (!this.positioned) {
      throw new Error(`location not positioned: ${this.getId()}`);
    }
  }


  public static clear(): void {
    Location.locations = {};
  }


  public drawBox(draw: Draw): void {
    const pos = this.getPosition();
    Log.debug(`positioning: ${this.name} at row ${this.row}, col ${this.col}, z ${this.z} => ${pos.x}, ${pos.y}`);
    draw.box(pos, this.width, this.height, this.link_url);
  }


  public getDirection(direction: string): Location {
    if (!direction_codes[direction]) {
      throw new Error(`invalid direction code: ${direction}`);
    }
    if (!this.directions[direction]) {
      throw new Error(`no location in this direction: ${direction}`);
    }
    return this.directions[direction];
  }


  public getDirections(): any {
    return this.directions;
  }


  public getId(): string {
    return this.name.replace(/\s+/g, "_").toLowerCase();
  }


  public static getLocation(name: string): Location {
    name = name.trim();
    if (!Location.locations[name]) {
      Location.locations[name] = new Location(name);
    }
    return Location.locations[name];
  }


  public getPosition(): { x: number, y: number } {
    return Cell.getCell(this.row, this.col).getPosition(this.z);
/*
    const min_z = Math.min(Location.col_z_extrema[this.col].min, Location.row_z_extrema[this.row].min);
    const max_z = Math.max(Location.col_z_extrema[this.col].max, Location.row_z_extrema[this.row].max);
    const out = {
      x: 120 + 100 * (this.z - Location.col_z_extrema[this.col].min),
      y: 120 +  40 * (Location.row_z_extrema[this.row].max - this.z),
    };
    for (let i = Location.min_col; i < this.col; i += 1) {
      out.x += (Location.col_z_extrema[i].max - Location.col_z_extrema[i].min + 1) * 150;
    }
    for (let i = Location.min_row; i < this.row; i += 1) {
      out.y += (Location.row_z_extrema[i].max - Location.row_z_extrema[i].min + 1) *  50;
    }
    Log.debug(`getPosition() for ${this.getId()} ${this.row}, ${this.col}, ${this.z}, ${Location.min_row}, ${Location.min_col}, ${min_z}, ${max_z} returns ${out.x}, ${out.y}`);
    return out;
*/
  }

  public drawText(draw: Draw): void {
    this.checkPositioned();
    const pos = this.getPosition();
    draw.text(pos, this.name);
  }


  private positionRelativeIfNecessary(direction: string): void {
    this.checkPositioned();
    const other_location: Location = this.directions[direction];
    if (!other_location.positioned) {
      const delta = direction_codes[direction];
      if (delta) {
        other_location.setPosition(this.col + delta.col, this.row + delta.row, this.z + delta.z);
      }
    }
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


  public getPosition(z?: number): { x: number, y: number } {
    const out = {
      x: 20 + (100 * ((z || 0) - Cell.getMinZInCol(this.col))),
      y: 20 + ( 40 * (Cell.getMaxZInRow(this.row) - (z || 0))),
    }
    for (let i = Cell.min_col; i < this.col; i += 1) {
      out.x += (Cell.getMaxZInCol(i) - Cell.getMinZInCol(i)) * 100 + 150;
    }
    for (let i = Cell.min_row; i < this.row; i += 1) {
      out.y += (Cell.getMaxZInRow(i) - Cell.getMinZInRow(i)) *  40 +  60;
    }
    return out;
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
