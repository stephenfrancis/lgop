
import Block from "./Block";

export enum State {
  AddingData,
  BlockLayout,
  ConnectorLayout,
}

export default class Diagram {
  private blocks: { [index: string]: Block };
  private state: State;
  private title: string;

  constructor() {
    this.blocks = {};
    this.state = State.AddingData;
  }


  public addBlock(block: Block): void {
    if (this.state !== State.AddingData) {
      throw new Error(`addBlock() can only be used when in AddingData state`);
    }
    const name: string = block.getName();
    if (this.blocks[name]) {
      throw new Error(`a block with name ${name} already exists in this diagram`);
    }
    this.blocks[name] = block;
  }


  public forEachBlock(callback: (block: Block) => void): void {
    Object.keys(this.blocks).forEach((name) => {
      callback(this.blocks[name]);
    });
  }


  public getBlock(name: string): Block | null {
    return this.blocks[name];
  }


  public getBlockNames(): string[] {
    return Object.keys(this.blocks);
  }


  public getBlockThrowIfUnrecognized(name: string): Block {
    const block: Block = this.getBlock(name);
    if (!block) {
      throw new Error(`no block found with name ${name}`);
    }
    return block;
  }


  public getMaxX(): number {
    let max_x: number = Number.NEGATIVE_INFINITY;
    this.forEachBlock((block) => {
      const x: number = block.getCentre().getX() + (block.getWidth() / 2);
      if (x > max_x) {
        max_x = x;
      }
    });
    return max_x + 15; // allow for border and connector paths
  }


  public getMaxY(): number {
    let max_y: number = Number.NEGATIVE_INFINITY;
    this.forEachBlock((block) => {
      const y: number = block.getCentre().getY() + (block.getHeight() / 2);
      if (y > max_y) {
        max_y = y;
      }
    });
    return max_y + 15; // allow for border and connector paths
  }


  public getTitle(): string {
    return this.title;
  }


  public output(): string {
    let out = "";
    this.forEachBlock((block) => {
      out += "\n"+ block.output();
    });
    return out;
  }


  public removeBlock(name: string): void {
    if (this.state !== State.AddingData) {
      throw new Error(`removeBlock() can only be used when in AddingData state`);
    }
    delete this.blocks[name];
  }


  public setTitle(title: string): void {
    this.title = title;
  }

}
