
import Block from "../core/Block";
import Diagram from "../core/Diagram";
import ILayout from "./ILayout";
import Point from "../core/Point";


interface Profile {
  margin_left: number;
  margin_top: number;
  height: number | "block";
  id: string;
  inter_block_padding_x: number;
  inter_block_padding_y: number;
  width: number | "block";
}

const profiles: {[index:string]: Profile} = {
  svg: {
    margin_left: 15, // allow for connector paths
    margin_top: 15, // allow for connector paths
    height: "block",
    id: "svg",
    inter_block_padding_x: 30,
    inter_block_padding_y: 30,
    width: "block",
  },
  cell: {
    margin_left: 0,
    margin_top: 0,
    height: 1,
    id: "cell",
    inter_block_padding_x: 0,
    inter_block_padding_y: 0,
    width: 1,
  },
  double_cell: {
    margin_left: 0,
    margin_top: 0,
    height: 1,
    id: "double_cell",
    inter_block_padding_x: 1,
    inter_block_padding_y: 1,
    width: 1,
  }
}

export default class Scale implements ILayout {
  private columns: Column[];
  private rows: Row[];
  private max_col: number;
  private max_row: number;
  private min_col: number;
  private min_row: number;
  private profile: any;

  constructor(profile?: string) {
    this.columns = [];
    this.rows = [];
    this.max_row = Number.NEGATIVE_INFINITY;
    this.max_col = Number.NEGATIVE_INFINITY;
    this.min_row = Number.POSITIVE_INFINITY;
    this.min_col = Number.POSITIVE_INFINITY;
    this.setProfile(profile || "svg");
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
    // console.log(`Scale.addBlock() adding ${block} to Col ${x} and Row ${y}`);
    this.getRow(y).add(block);
    this.getColumn(x).add(block);
  }


  public beginDiagram(diagram: Diagram) {
    diagram.forEachBlock((block: Block) => {
      this.addBlock(block);
    });
  }


  private getColumn(x: number): Column {
    if (!this.columns[x]) {
      this.columns[x] = new Column(x);
    }
    return this.columns[x];
  }


  public getProfile(): any {
    return this.profile;
  }


  private getRow(y: number) {
    if (!this.rows[y]) {
      this.rows[y] = new Row(y);
    }
    return this.rows[y];
  }


  public iterate(): boolean {
    this.rescaleColumns();
    this.rescaleRows();
    return false;
  }


  private rescaleColumns(): void {
    let new_x: number = this.profile.margin_left;
    for (let i = this.min_col; i <= this.max_col; i += 1) {
      if (this.columns[i]) {
        new_x += this.columns[i].rescale(new_x, this.profile.width)
          + this.profile.inter_block_padding_x;
      }
    }
  }


  private rescaleRows(): void {
    let new_y: number = this.profile.margin_top;
    for (let i = this.min_row; i <= this.max_row; i += 1) {
      if (this.rows[i]) {
        new_y += this.rows[i].rescale(new_y, this.profile.height)
          + this.profile.inter_block_padding_y;
      }
    }
  }


  public setProfile(profile_id: string): void {
    this.profile = profiles[profile_id];
    if (!this.profile) {
      throw new Error(`unrecognized profile: ${profile_id}`);
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


  public rescale(new_x: number, by: number | "block"): number {
    const old_x: number = this.x;
    if (by === "block") {
      by = this.max_width;
    }
    this.x = new_x + Math.floor(by / 2);
    // console.log(`Column.rescale() ${old_x} to ${this.x}`);
    this.blocks.forEach((block: Block) => {
      block.setCentre(new Point(this.x, block.getCentre().getY()));
    });
    return by;
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


  public rescale(new_y: number, by: number | "block"): number {
    const old_y: number = this.y;
    if (by === "block") {
      by = this.max_height;
    }
    this.y = new_y + Math.floor(by / 2);
    // console.log(`Row.rescale() ${old_y} to ${this.y}`);
    this.blocks.forEach((block: Block) => {
      block.setCentre(new Point(block.getCentre().getX(), this.y));
    });
    return by;
  }

}
