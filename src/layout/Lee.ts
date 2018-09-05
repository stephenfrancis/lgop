
import Block from "../core/Block";
import Connector from "../core/Connector";
import Diagram from "../core/Diagram";
import ILayout from "./ILayout";
import LineSegment from "../core/LineSegment";
import Point from "../core/Point";

const margin_left: number = 15; // allow for connector paths
const margin_top: number = 15; // allow for connector paths
const inter_block_padding_x: number = 30;
const inter_block_padding_y: number = 30;


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
    console.log(`beginDiagram() blocks loaded: ${this}`);
    let i: number = 0;
    diagram.forEachBlock((block: Block) => {
      if (i === 0) {
        this.doBlock(block);
      }
      // i += 1;
    });
    console.log(`beginDiagram() blocks done: ${this}`);
  }


  public clear(): void {
    this.cells = [];
    this.max_x = Number.NEGATIVE_INFINITY;
    this.max_y = Number.NEGATIVE_INFINITY;
    this.min_x = Number.POSITIVE_INFINITY;
    this.min_y = Number.POSITIVE_INFINITY;
  }


  private doBlock(block: Block): void {
    let i: number = 0;
    block.getConnectors().forEach((connector: Connector) => {
      if (i === 0) {
        this.doConnector(connector);
      }
      // i += 1;
    });
  }


  private doConnector(connector: Connector): void {
    const [fr_x, fr_y] = this.getBlockCoordinates(connector.getFrom());
    const [to_x, to_y] = this.getBlockCoordinates(connector.getTo());
    this.resetScores();
    this.makeCellAt(fr_x, fr_y + 1).workOut(this, this.makeCellAt(to_x - 1, to_y));
  }


  private getBlockCoordinates(block: Block): [number, number] {
    const x: number = block.getCentre().getX() * 2;
    const y: number = block.getCentre().getY() * 2;
    return [x, y];
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
    for (let x = this.min_x; x <= this.max_x; x += 1) {
      if (this.cells[x]) {
        let str: string = `${x}-- `;
        this.loopOverCellsY(x, (cell: Cell) => {
          const text: string = String(cell.getScore());
          str += ("     ").substr(text.length) + text;
        });
        console.log(str);
      }
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
  private blocks: Block[];
  private score: number;
  private x: number;
  private y: number;

  constructor(x: number, y: number) {
    this.blocks = [];
    this.score = null;
    this.x = x;
    this.y = y;
  }


  public addBlock(block: Block): void {
    this.blocks.push(block);
  }


  public getScore(): number {
    return this.score;
  }


  public resetScore(): void {
    this.score = null;
  }


  public toString(): string {
    return `${this.x}, ${this.y} - ${this.score}`;
  }


  public workBack(lee: Lee, origin: Cell, dir: string, corner_points: [number, number][]): void {
    // console.log(`workBack() ${this}`);
    if (this === origin) {
      // console.log(`finished!`);
      return;
    }
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
    checkNeighbour(dir);
    checkNeighbour(delta[dir].left);
    checkNeighbour(delta[dir].right);
    if (!best_neigbour) {
      throw new Error(`workBack() failed`);
    }
    if (dir !== new_dir) {
      corner_points.push([this.x, this.y]);
    }
    best_neigbour.workBack(lee, origin, new_dir, corner_points);
  }


  public workOut(lee: Lee, target: Cell): void {
    console.log(`workOut() ${lee} ${this} ${this.blocks[0]} ${target} ${this.score} ${this.blocks.length}`);
    this.score = 0;
    this.workOutCellAtPosition(lee);
    for (let i: number = 1; i < 50; i += 1) {
      this.workOutAtRadius(lee, i);
    }
    const corner_points: [number, number][] = [];
    target.workBack(lee, this, 'W', corner_points);
    console.log(`line segments: ${JSON.stringify(corner_points)}`);
  }


  public workOutAtRadius(lee: Lee, radius: number): void {
    let x: number = this.x - radius;
    let y: number = this.y;
    while (x <= this.x) {
      this.workOutCell(lee, x, y);
      x += 1;
      y -= 1;
    }
    while (y <= this.y) {
      this.workOutCell(lee, x, y);
      x += 1;
      y += 1;
    }
    while (x >= this.x) {
      this.workOutCell(lee, x, y);
      x -= 1;
      y += 1;
    }
    while (y >= this.y) {
      this.workOutCell(lee, x, y);
      x -= 1;
      y -= 1;
    }
  }


  public workOutCell(lee: Lee, x: number, y: number): void {
    const cell: Cell = lee.makeCellAtWithinBounds(x, y);
    // console.log(`workOutCell() [${x}, ${y}] ${cell}`);
    if (cell && cell.blocks.length === 0 && typeof cell.score === "number") {
      cell.workOutCellAtPosition(lee);
    }
  }


  private workOutCellAtPosition(lee) {
    const doNeighbour = (dir: string) => {
      const cell: Cell = lee.makeCellAtWithinBounds(this.x + delta[dir].x, this.y + delta[dir].y);
      if (cell && cell.score === null && cell.blocks.length === 0) {
        cell.score = this.score + 1;
      }
    }
    doNeighbour("N");
    doNeighbour("E");
    doNeighbour("S");
    doNeighbour("W");
  }

}
