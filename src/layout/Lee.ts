
import Block from "../core/Block";
import Connector from "../core/Connector";
import Diagram from "../core/Diagram";
import Direction from "../core/Direction";
import ILayout from "./ILayout";
import LineSegment from "../core/LineSegment";
import Point from "../core/Point";
import Vector from "../core/Vector";


const pad = function (str, num) {
  return (" ").repeat(Math.max(num - str.length, 0)) + str;
}

export default class Lee implements ILayout {
  private cells: Cell[][];
  private max_x: number;
  private max_y: number;
  private min_x: number;
  private min_y: number;

  constructor() {
    this.clear();
  }


  public addBlock(block: Block): void {
    const cell: Cell = this.makeCellAt(block.getCentre());
    cell.addBlock(block);
  }


  public beginDiagram(diagram: Diagram): void {
    this.clear();
    diagram.forEachBlock((block: Block) => {
      this.addBlock(block);
    });
    diagram.forEachBlock((block: Block) => {
      this.doBlock(block);
    });
  }


  public clear(): void {
    this.cells = [];
    this.max_x = Number.NEGATIVE_INFINITY;
    this.max_y = Number.NEGATIVE_INFINITY;
    this.min_x = Number.POSITIVE_INFINITY;
    this.min_y = Number.POSITIVE_INFINITY;
  }


  private doBlock(block: Block): void {
    // const report: boolean = (block.getName().indexOf("Now THIS Is My Kind") === 0);
    block.getConnectors().forEach((connector: Connector) => {
      this.doConnector(connector, false);
    });
  }


  private doConnector(connector: Connector, report: boolean): void {
    const from_dir: Direction = connector.getFromDirection();
    const fr_p: Point = connector.getFrom().getCentre().add(from_dir.getDeltaUnit());

    const to_dir: Direction = connector.getToDirection();
    const to_p: Point = connector.getTo()  .getCentre().add(  to_dir.getDeltaUnit());

    this.resetScores();
    const corner_points: Point[] = this.makeCellAt(fr_p)
      .workOut(this, this.makeCellAt(to_p),
        connector.getToDirection().toString().charAt(0), report);
    let prev_point: Point = null;
    corner_points.reverse().forEach((point: Point) => {
      if (prev_point) {
        connector.addLineSegment(new LineSegment(prev_point, point));
      }
      prev_point = point;
    });
    if (report) {
      this.output();
      console.log(`From ${connector.getFrom()} to ${connector.getTo()}: ${JSON.stringify(corner_points)}`);
    }
  }


  public getMaxRadius(): number {
    return Math.ceil(Math.sqrt(
        Math.pow(this.max_x - this.min_x + 1, 2)
      + Math.pow(this.max_y - this.min_y + 1, 2)));
  }


  public iterate(): boolean {
    return false;
  }


  public loopOverCellsX(callback: (Cell) => void): void {
    for (let x = this.min_x; x <= this.max_x; x += 1) {
      if (this.cells[x]) {
        this.loopOverCellsY(x, callback);
      }
    }
  }


  public loopOverCellsY(x: number, callback: (Cell) => void): void {
    for (let y = this.min_y; y <= this.max_y; y += 1) {
      if (this.cells[x][y]) {
        callback(this.cells[x][y]);
      }
    }
  }


  public makeCellAt(point: Point): Cell {
    const x: number = point.getX();
    const y: number = point.getY();
    if (x < this.min_x) {
      this.min_x = x;
    }
    if (y < this.min_y) {
      this.min_y = y;
    }
    if (x > this.max_x) {
      this.max_x = x;
    }
    if (y > this.max_y) {
      this.max_y = y;
    }
    if (!this.cells[x]) {
      this.cells[x] = [];
    }
    if (!this.cells[x][y]) {
      this.cells[x][y] = new Cell(point);
    }
    return this.cells[x][y];
  }


  public makeCellAtWithinBounds(point: Point): Cell {
    const x: number = point.getX();
    const y: number = point.getY();
    if (x < this.min_x || x > this.max_x || y < this.min_y || y > this.max_y) {
      return null;
    }
    return this.makeCellAt(point);
  }


  public output(what?: string): void {
    what = what || "score";
    let header: string = "       ";
    const lines: string[] = [];
    for (let y = this.min_y; y <= this.max_y; y += 1) {
      lines[y] = pad(y.toFixed(0), 5) + ": ";
    }
    for (let x = this.min_x; x <= this.max_x; x += 1) {
      header += pad(x.toFixed(0), 3);
      this.cells[x] = this.cells[x] || [];
      for (let y = this.min_y; y <= this.max_y; y += 1) {
        if (this.cells[x][y]) {
          const score: number = this.cells[x][y].getVal(what);
          if (score !== null) {
            lines[y] += pad(score.toFixed(0), 3);
          } else if (this.cells[x][y].getBlock()) {
            lines[y] += " []";
          } else {
            lines[y] += " - ";
          }
        } else {
          lines[y] +=  " . ";
        }
      }
    }
    console.log(header);
    for (let y = this.min_y; y <= this.max_y; y += 1) {
      console.log(lines[y]);
    }
  }


  public resetScores(): void {
    this.loopOverCellsX((cell: Cell) => {
      cell.resetScore();
    });
  }


  public toString(): string {
    return `[${this.min_x}, ${this.min_y}] / [${this.max_x}, ${this.max_y}]`;
  }

}


const delta = {
  N: { p: new Point( 0, -1), x:  0, y: -1, left: "W", right: "E", },
  E: { p: new Point( 1,  0), x:  1, y:  0, left: "N", right: "S", },
  S: { p: new Point( 0,  1), x:  0, y:  1, left: "E", right: "W", },
  W: { p: new Point(-1,  0), x: -1, y:  0, left: "S", right: "N", },
}

class Cell {
  private block: Block;
  private lines_horiz: number;
  private lines_vert : number;
  private point: Point;
  private score: number;

  constructor(point: Point) {
    this.block = null;
    this.score = null;
    this.lines_horiz = 0;
    this.lines_vert  = 0;
    this.point = point;
  }


  public addBlock(block: Block): void {
    if (this.block) {
      throw new Error(`only one block allowed per cell`);
    }
    this.block = block;
  }


  public getBlock(): Block {
    return this.block;
  }


  public getVal(what: string): number {
    return this[what];
  }


  public getScore(): number {
    return this.score;
  }


  public resetScore(): void {
    this.score = null;
  }


  public toString(): string {
    return `${this.point} - ${this.score || this.block || "[space]"}`;
  }


  public workBack(lee: Lee, proc: any): Cell {
    // console.log(`workBack() ${this}`);
    let score: number = Number.POSITIVE_INFINITY;
    let best_neigbour: Cell = null;
    let new_dir: string = null;

    if (proc.dir === "N" || proc.dir === "S") {
      this.lines_vert += 1;
    } else {
      this.lines_horiz += 1;
    }

    const checkNeighbour = (dir: string) => {
      const cell: Cell = lee.makeCellAtWithinBounds(this.point.add(delta[dir].p));
      if (!cell) {
        return;
      }
      let cell_score = cell.getScore();
      if (Number.isFinite(cell_score) && cell_score < score) {
        score = cell_score;
        best_neigbour = cell;
        new_dir = dir;
      }
    }

    checkNeighbour(proc.dir);
    checkNeighbour(delta[proc.dir].left);
    checkNeighbour(delta[proc.dir].right);
    if (!best_neigbour) {
      throw new Error(`workBack() failed`);
    }
    if (proc.dir !== new_dir) {
      proc.corner_points.push(this.point);
    }
    proc.dir = new_dir;
    return best_neigbour;
  }


  public workOut(lee: Lee, target: Cell, to_dir: string, report: boolean): Point[] {
    // console.log(`workOut() ${this} ${target} ${this.score} ${this.block}`);
    this.score = 0;
    this.workOutCellAtPosition(lee);
    for (let i: number = 1; i < lee.getMaxRadius(); i += 1) {
      this.workOutAtRadius(lee, i);
    }
    const corner_points: Point[] = [];
    const proc: any = {
      corner_points,
      counter: 0,
      dir: to_dir,
    };
    corner_points.push(target.point);
    let next_cell: Cell = target;
    while (next_cell !== this && proc.counter < 100) {
      next_cell = next_cell.workBack(lee, proc);
      proc.counter += 1;
    }
    corner_points.push(this.point);
    // console.log(`line segments: ${JSON.stringify(corner_points)} ${proc.counter}`);
    return corner_points;
  }


  public workOutAtRadius(lee: Lee, radius: number): void {
    // console.log(`workOutAtRadius() ${this.x}, ${this.y} radius: ${radius}`);
    let x: number = this.point.getX() - radius;
    let y: number = this.point.getY();
    while (x < this.point.getX()) {
      // console.log(`workOutAtRadius() NE ${x} <= ${this.x}, ${y} ${this.y}`);
      this.workOutCell(lee, x, y);
      x += 1;
      y -= 1;
    }
    while (y < this.point.getY()) {
      // console.log(`workOutAtRadius() SE ${x} ${this.x}, ${y} <= ${this.y}`);
      this.workOutCell(lee, x, y);
      x += 1;
      y += 1;
    }
    while (x > this.point.getX()) {
      this.workOutCell(lee, x, y);
      x -= 1;
      y += 1;
    }
    while (y > this.point.getY()) {
      this.workOutCell(lee, x, y);
      x -= 1;
      y -= 1;
    }
  }


  public workOutCell(lee: Lee, x: number, y: number): void {
    const cell: Cell = lee.makeCellAtWithinBounds(new Point(x, y));
    // console.log(`workOutCell() [${x}, ${y}] ${cell}`);
    if (cell && !cell.block && typeof cell.score === "number") {
      cell.workOutCellAtPosition(lee);
    }
  }


  private workOutCellAtPosition(lee) {
    const doNeighbour = (dir: string) => {
      const cell: Cell = lee.makeCellAtWithinBounds(this.point.add(delta[dir].p));
      if (cell && cell.score === null && !cell.block) {
        cell.score = this.score + 1;
      }
    }
    doNeighbour("N");
    doNeighbour("E");
    doNeighbour("S");
    doNeighbour("W");
  }

}
