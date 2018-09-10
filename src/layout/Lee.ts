
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
    const [x, y] = this.getBlockCoordinates(block);
    const cell: Cell = this.makeCellAt(x, y);
    cell.addBlock(block);
  }


  public beginDiagram(diagram: Diagram): void {
    this.clear();
    diagram.forEachBlock((block: Block) => {
      this.addBlock(block);
    });
    // console.log(`beginDiagram() blocks loaded: ${this}`);
    // let i: number = 0;
    diagram.forEachBlock((block: Block) => {
      // if (i === 0) {
        this.doBlock(block);
      // }
      // i += 1;
    });
    // console.log(`beginDiagram() blocks done: ${this}`);
  }


  public clear(): void {
    this.cells = [];
    this.max_x = Number.NEGATIVE_INFINITY;
    this.max_y = Number.NEGATIVE_INFINITY;
    this.min_x = Number.POSITIVE_INFINITY;
    this.min_y = Number.POSITIVE_INFINITY;
  }


  private doBlock(block: Block): void {
    // let i: number = 0;
    block.getConnectors().forEach((connector: Connector) => {
      // if (i === 0) {
        this.doConnector(connector);
      // }
      // i += 1;
    });
  }


  private doConnector(connector: Connector): void {
    const from_dir: Direction = connector.getFromDirection();
    let [fr_x, fr_y] = this.getBlockCoordinates(connector.getFrom());
    fr_x += from_dir.getDeltaCol();
    fr_y += from_dir.getDeltaRow();

    const to_dir: Direction = connector.getToDirection();
    let [to_x, to_y] = this.getBlockCoordinates(connector.getTo());
    to_x +=   to_dir.getDeltaCol();
    to_y +=   to_dir.getDeltaRow();

    this.resetScores();
    const corner_points: Point[] = this.makeCellAt(fr_x, fr_y)
      .workOut(this, this.makeCellAt(to_x, to_y),
      connector.getToDirection().toString().charAt(0));
    let prev_point: Point = null;
    corner_points.reverse().forEach((point: Point) => {
      if (prev_point) {
        connector.addLineSegment(new LineSegment(prev_point, point));
      }
      prev_point = point;
    });
    console.log(`From ${connector.getFrom()} to ${connector.getTo()}: ${JSON.stringify(corner_points)}`);
  }


  private getBlockCoordinates(block: Block): [number, number] {
    const x: number = block.getCentre().getX();
    const y: number = block.getCentre().getY();
    return [x, y];
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


  public makeCellAt(x: number, y: number): Cell {
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
      this.cells[x][y] = new Cell(x, y);
    }
    return this.cells[x][y];
  }


  public makeCellAtWithinBounds(x: number, y: number): Cell {
    if (x < this.min_x || x > this.max_x || y < this.min_y || y > this.max_y) {
      return null;
    }
    return this.makeCellAt(x, y);
  }


  public output(): void {
    const lines: string[] = [];
    for (let x = this.min_x; x <= this.max_x; x += 1) {
      lines[x] = pad(x.toFixed(0), 5) + ": ";
      this.cells[x] = this.cells[x] || [];
      for (let y = this.min_y; y <= this.max_y; y += 1) {
        if (this.cells[x][y]) {
          const score: number = this.cells[x][y].getScore();
          if (score !== null) {
            lines[x] += pad(score.toFixed(0), 3);
          } else if (this.cells[x][y].getBlock()) {
            lines[x] += " []";
          } else {
            lines[x] += " - ";
          }
        } else {
          lines[x] +=  " . ";
        }
      }
    }
    for (let x = this.min_x; x <= this.max_x; x += 1) {
      console.log(lines[x]);
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
  N: { x:  0, y: -1, left: "W", right: "E", },
  E: { x:  1, y:  0, left: "N", right: "S", },
  S: { x:  0, y:  1, left: "E", right: "W", },
  W: { x: -1, y:  0, left: "S", right: "N", },
}

class Cell {
  private block: Block;
  private score: number;
  private x: number;
  private y: number;

  constructor(x: number, y: number) {
    this.block = null;
    this.score = null;
    this.x = x;
    this.y = y;
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


  public getScore(): number {
    return this.score;
  }


  public resetScore(): void {
    this.score = null;
  }


  public toString(): string {
    return `${this.x}, ${this.y} - ${this.score || this.block || "[space]"}`;
  }


  public workBack(lee: Lee, proc: any): Cell {
    // console.log(`workBack() ${this}`);
    let score: number = Number.POSITIVE_INFINITY;
    let best_neigbour: Cell = null;
    let new_dir: string = null;

    const checkNeighbour = (dir: string) => {
      const cell: Cell = lee.makeCellAtWithinBounds(this.x + delta[dir].x, this.y + delta[dir].y);
      if (!cell) {
        return;
      }
      let cell_score = cell.getScore();
      if (cell_score < score) {
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
      proc.corner_points.push(new Point(this.x, this.y));
    }
    proc.dir = new_dir;
    return best_neigbour;
  }


  public workOut(lee: Lee, target: Cell, to_dir: string): Point[] {
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
    corner_points.push(new Point(target.x, target.y));
    let next_cell: Cell = target;
    while (next_cell !== this && proc.counter < 100) {
      next_cell = next_cell.workBack(lee, proc);
      proc.counter += 1;
    }
    corner_points.push(new Point(this.x, this.y));
    // console.log(`line segments: ${JSON.stringify(corner_points)} ${proc.counter}`);
    return corner_points;
  }


  public workOutAtRadius(lee: Lee, radius: number): void {
    // console.log(`workOutAtRadius() ${this.x}, ${this.y} radius: ${radius}`);
    let x: number = this.x - radius;
    let y: number = this.y;
    while (x < this.x) {
      // console.log(`workOutAtRadius() NE ${x} <= ${this.x}, ${y} ${this.y}`);
      this.workOutCell(lee, x, y);
      x += 1;
      y -= 1;
    }
    while (y < this.y) {
      // console.log(`workOutAtRadius() SE ${x} ${this.x}, ${y} <= ${this.y}`);
      this.workOutCell(lee, x, y);
      x += 1;
      y += 1;
    }
    while (x > this.x) {
      this.workOutCell(lee, x, y);
      x -= 1;
      y += 1;
    }
    while (y > this.y) {
      this.workOutCell(lee, x, y);
      x -= 1;
      y -= 1;
    }
  }


  public workOutCell(lee: Lee, x: number, y: number): void {
    const cell: Cell = lee.makeCellAtWithinBounds(x, y);
    // console.log(`workOutCell() [${x}, ${y}] ${cell}`);
    if (cell && !cell.block && typeof cell.score === "number") {
      cell.workOutCellAtPosition(lee);
    }
  }


  private workOutCellAtPosition(lee) {
    const doNeighbour = (dir: string) => {
      const cell: Cell = lee.makeCellAtWithinBounds(this.x + delta[dir].x, this.y + delta[dir].y);
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
