
import Block from "./Block";
import Connector from "./Connector";

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


  public copy(): Diagram {
    const new_d: Diagram = new Diagram();
    new_d.setTitle(this.getTitle());
    this.forEachBlock((block: Block) => {
      new_d.addBlock(block.copy());
      console.log(`copied block ${block.getName()}`);
    });
    this.forEachBlock((block: Block) => {
      const new_b: Block = new_d.getBlock(block.getName());
      const conns: Connector[] = block.getConnectors();
      for (let i: number = 0; i < conns.length; i += 1) {
        new_b.addConnector(
          this.getBlock(conns[i].getTo().getName()),
          conns[i].getFromDirection(),
          conns[i].getToDirection());
        console.log(`copied connector ${i} for block ${block.getName()} going to ${conns[i].getTo().getName()}`);
      }
    });
    return new_d;
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
    let out = `  ${this.getTitle()}\n  ===============\n[${this.getMaxX()}, ${this.getMaxY()}]\n`;
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


  public reset(): void {
    this.forEachBlock((block: Block) => {
      block.reset();
    });
  }


  public setTitle(title: string): void {
    this.title = title;
  }

}
