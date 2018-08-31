
import Block from "./Block";
import Direction from "./Direction";
import LineSegment from "./LineSegment";
import Point from "./Point";
import Vector from "./Vector";


export default class Connector {
  private from: Block;
  private from_dir?: Direction;
  private to: Block;
  private to_dir?: Direction;
  private lines: LineSegment[];

  constructor(from: Block, to: Block, from_dir?: Direction, to_dir?: Direction) {
    this.from = from;
    this.from_dir = from_dir;
    this.to = to;
    this.to_dir = to_dir;
    this.lines = [];
  }


  public addLineSegment(line: LineSegment): void {
    this.lines.push(line);
  }


  public amendNewPosition(position: Point, fraction: number): Point {
    if (!this.from_dir) {
      return;
    }
    const delta_x: number = this.from.getCentre().getX() * fraction * this.from_dir.getDeltaCol();
    const delta_y: number = this.from.getCentre().getY() * fraction * this.from_dir.getDeltaRow();
    return new Point(position.getX() + delta_x, position.getY() + delta_y);
  }


  public forEachLineSegment(callback: (line: LineSegment) => void): void {
    this.lines.forEach((line: LineSegment) => {
      callback(line);
    });
  }


  public getFrom(): Block {
    return this.from;
  }


  public getFromDirection(): Direction {
    if (this.from_dir) {
      return this.from_dir;
    }
    const v: Vector = Vector.between(this.to.getCentre(), this.from.getCentre());
    return Direction.nearest(v.getBearing());
  }


  public getTo(): Block {
    return this.to;
  }


  public getToDirection(): Direction {
    if (this.to_dir) {
      return this.to_dir;
    }
    const v: Vector = Vector.between(this.to.getCentre(), this.from.getCentre());
    return Direction.nearest(v.getBearing());
  }


  public output(): string {
    return `${(this.from_dir || "")} to ${this.to} ${(this.to_dir || "")}`;
  }


  public resetLineSegments(): void {
    this.lines = [];
  }


  public shift(from: Point, dir: Direction): Point {
    const len = 20;
    return new Point(
      from.getX() + (len * dir.getAngleSin()),
      from.getY() - (len * dir.getAngleCos()),
    );
  }


  public toString(): string {
    return `from ${this.from} ${(this.from_dir || "")} to ${this.to} ${(this.to_dir || "")}`;
  }

}
