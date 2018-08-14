
import * as React from "react";
import RootLog from "../../lapis/node_modules/@types/loglevel/index";
import Block from "./core/Block";
import Direction from "./Direction";
import Point from "./Point";

const Log = RootLog.getLogger("lgop.Map");
const basePoint = new Point(20, 5);


export default class Map {
  private blocks: { [index: string]: Block };
  private id: string;
  private title: string;

  constructor(id: string, content: string) {
    this.id = id;
    this.blocks = {};
    this.parseContent(content);
    this.calcLayout();
  }


  private calcLayout() {
    this.setAllBlocksInitialPositions();
    for (let i = 0; i < 5; i += 1) {
      const new_positions: { [index: string]: Point } =
        this.initializeNewPositions();
      this.calcNewPositions(new_positions);
      this.setAllBlocksNewPositions(new_positions);
    }
    this.shiftAllBlocksIntoView();
    this.reportBlockPositions();
  }


  private calcNewPositions(new_positions: { [index: string]: Point }) {
    Object.keys(this.blocks).forEach(block_id => {
      const block: Block = this.blocks[block_id];
      const fraction: number = block.getConnectors().length;
      block.getConnectors().forEach(connector => {
        let new_position: Point = new_positions[connector.getTo().getName()];
        connector.amendNewPosition(new_position, fraction);
      });
    });
  }


  public getOrAddBlock(name: string) {
    name = name.trim();
    if (!this.blocks[name]) {
      this.blocks[name] = new Block(name);
    }
    return this.blocks[name];
  }


  public getSVG(): JSX.Element {
    const children: JSX.Element[] = [];
    Object.keys(this.blocks).forEach(block_id => children.push(this.blocks[block_id].svg()));
    return (
      <svg height="800" version="1.1" width="1200" xmlns="http://www.w3.org/2000/svg">
        {children}
      </svg>
    );
  }


  public getTitle(): string {
    return this.title;
  }


  private initializeNewPositions(): { [index: string]: Point } {
    const new_positions: { [index: string]: Point } = {};
    Object.keys(this.blocks).forEach(block_id => {
      const point: Point = new Point(0, 0);
      point.setTo(this.blocks[block_id].getCentre());
      new_positions[block_id] = point;
    });
    return new_positions;
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
      parse_state.block.setLink(match[2], match[1]);
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
    const parse_state: {
      inside_room: boolean,
      block?: Block,
    } = {
      inside_room: false,
    }
    lines.forEach(function (line) {
      let done = false;
      done = done || that.isBlock(line, parse_state);
      done = done || that.isConnector(line, parse_state);
      done = done || that.isTitle(line, parse_state);
      if (!done) {
        that.reportError("unused line: " + line);
      }
    });
  }


  private reportError(str: string): void {
    console.log(this.id + ": " + str); // eslint-disable-line no-console
  }


  public reportBlockPositions(): void {
    Object.keys(this.blocks).forEach(block_id => {
      console.log(this.blocks[block_id].toString());
    });
  }


  private setAllBlocksInitialPositions() {
    Object.keys(this.blocks).forEach(block_id => {
      this.blocks[block_id].getCentre().setTo(basePoint);
    });
  }


  private setAllBlocksNewPositions(new_positions: { [index: string]: Point }) {
    Object.keys(new_positions).forEach(block_id => {
      this.blocks[block_id].getCentre().setTo(new_positions[block_id]);
    });
  }


  private shiftAllBlocksIntoView() {
    const x_thresh: number = 200;
    const y_thresh: number = 50;
    let min_x: number = x_thresh;
    let min_y: number = y_thresh;
    Object.keys(this.blocks).forEach(block_id => {
      const point: Point = this.blocks[block_id].getCentre();
      min_x = Math.min(min_x, point.getX());
      min_y = Math.min(min_y, point.getY());
    });
    if (min_x < x_thresh || min_y < y_thresh) {
      Object.keys(this.blocks).forEach(block_id => {
        const point: Point = this.blocks[block_id].getCentre();
        point.setX(point.getX() + (x_thresh - min_x));
        point.setY(point.getY() + (y_thresh - min_y));
      });
    }
  }

}
