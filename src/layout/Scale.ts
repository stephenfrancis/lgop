
import Block from "../core/Block";
import Connector from "../core/Connector";
import Diagram from "../core/Diagram";
import Point from "../core/Point";

export default class Scale {
  private columns: Column[];
  private rows: Row[];
  private max_col: number;
  private max_row: number;
  private min_col: number;
  private min_row: number;

  constructor() {
    this.columns = [];
    this.rows = [];
    this.max_row = Number.NEGATIVE_INFINITY;
    this.max_col = Number.NEGATIVE_INFINITY;
    this.min_row = Number.POSITIVE_INFINITY;
    this.min_col = Number.POSITIVE_INFINITY;
  }


  private addBlock(block: Block) {
    const x: number = block.getCentre().getX();
    const y: number = block.getCentre().getY();
    if (x < this.min_col) {
      this.min_col = x;
    }
    if (y < this.min_row) {
      this.min_row = y;
    }
    if (x > this.max_col) {
      this.max_col = x;
    }
    if (y > this.max_row) {
      this.max_row = y;
    }
    this.getRow(y).add(block);
    this.getColumn(x).add(block);
  }


  private getColumn(x: number): Column {
    if (!this.columns[x]) {
      this.columns[x] = new Column(x);
    }
    return this.columns[x];
  }


  private getRow(y: number) {
    if (!this.rows[y]) {
      this.rows[y] = new Row(y);
    }
    return this.rows[y];
  }


  public layoutDiagram(diagram: Diagram) {
    diagram.forEachBlock((block: Block) => {
      this.addBlock(block);
    });
    this.rescaleColumns();
    this.rescaleRows();
  }


  private rescaleColumns(): void {
    let new_x: number = 0;
    for (let i = this.min_col; i < this.max_col; i += 1) {
      if (this.columns[i]) {
        new_x += this.columns[i].rescale(new_x);
      }
    }
  }


  private rescaleRows(): void {
    let new_y: number = 0;
    for (let i = this.min_row; i < this.max_row; i += 1) {
      if (this.rows[i]) {
        new_y += this.rows[i].rescale(new_y);
      }
    }
  }

}


export class Column {
  private max_width: number;
  private x: number;
  private blocks: Block[];

  constructor(x: number) {
    this.x = x;
    this.max_width = 0;
    this.blocks = [];
  }

  public add(block: Block): void {
    this.blocks.push(block);
    if (block.getWidth() > this.max_width) {
      this.max_width = block.getWidth();
    }
  }


  public getMaxWidth(): number {
    return this.max_width;
  }


  public rescale(new_x: number): number {
    this.x = new_x + (this.max_width / 2);
    this.blocks.forEach((block: Block) => {
      block.getCentre().setX(this.x);
    });
    new_x += this.max_width;
    return new_x;
  }

}


export class Row {
  private max_height: number;
  private y: number;
  private blocks: Block[];

  constructor(y: number) {
    this.y = y;
    this.max_height = 0;
    this.blocks = [];
  }


  public add(block: Block): void {
    this.blocks.push(block);
    if (block.getHeight() > this.max_height) {
      this.max_height = block.getHeight();
    }
  }


  public getMaxHeight(): number {
    return this.max_height;
  }


  public rescale(new_y: number): number {
    this.y = new_y + (this.max_height / 2);
    this.blocks.forEach((block: Block) => {
      block.getCentre().setY(this.y);
    });
    new_y += this.max_height;
    return new_y;
  }

}
