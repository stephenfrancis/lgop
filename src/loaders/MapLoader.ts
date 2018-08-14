
import Block from "../core/Block";
import Diagram from "../core/Diagram";
import Direction from "../core/Direction";


export default class MapLoader {
  private diagram: Diagram;

  constructor(diagram: Diagram) {
    this.diagram = diagram;
  }


  public getOrAddBlock(name: string): Block {
    name = name.trim();
    let block: Block = this.diagram.getBlock(name);
    if (!block) {
      block = new Block(name);
      this.diagram.addBlock(block);
    }
    return block;
  }


  private isBlock(line: string, parse_state: { block?: Block }): boolean {
    let match = line.match(/^\* (.*)$/);
    if (match && match.length > 1) {
      parse_state.block = this.getOrAddBlock(match[1]);
      return true;
    }
    return false;
  }


  private isConnector(line: string, parse_state: { block?: Block }): boolean {
    let match = line.match(/^ {2}\* (N|NE|E|SE|S|SW|W|NW|U|D): (.*)$/);
    if (match && match.length > 2 && parse_state.block) {
      const from_dir: Direction = Direction.get(match[1]);
      const to: Block = this.getOrAddBlock(match[2]);
      parse_state.block.addConnector(to, from_dir);
      return true;
    }
    match = line.match(/^ {2}\* C:\s*\[(.*?)\]\((.*)\)$/);
    if (match && match.length > 2 && parse_state.block) {
      parse_state.block.setLink(match[2]); // TODO what about match[1]?
    }
    return false;
  }


  private isTitle(line: string, parse_state: any): boolean {
    const match = line.match(/^# (.*)/);
    if (match) {
      this.diagram.setTitle(match[1]);
    }
    return !!match;
  }


  public parseContent(content: string) {
    this.parseLines(content.split(/\r\n|\n/));
  }


  public parseLines(lines: string[]) {
    const parse_state: {
      inside_room: boolean,
      block?: Block,
    } = {
      inside_room: false,
    }
    lines.forEach((line) => {
      let done = false;
      done = done || this.isBlock(line, parse_state);
      done = done || this.isConnector(line, parse_state);
      done = done || this.isTitle(line, parse_state);
      if (!done) {
        this.reportError("unused line: " + line);
      }
    });
  }


  private reportError(str: string): void {
    console.log(str); // eslint-disable-line no-console
  }

}
