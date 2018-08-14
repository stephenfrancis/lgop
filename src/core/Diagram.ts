
import Block from "./Block";

export enum State {
  AddingData,
  BlockLayout,
  ConnectorLayout,
}

export default class Diagram {
  private blocks: { [index: string]: Block };
  private state: State;

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

}
