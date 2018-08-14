
import Block from "./Block";
import Direction from "./Direction";
import Point from "./Point";


export default class Connector {
  private from: Block;
  private from_dir?: Direction;
  private to: Block;
  private to_dir?: Direction;

  constructor(from: Block, to: Block, from_dir?: Direction, to_dir?: Direction) {
    this.from = from;
    this.from_dir = from_dir;
    this.to = to;
    this.to_dir = to_dir;
  }


  public amendNewPosition(new_position: Point, fraction: number): void {
    if (!this.from_dir) {
      return;
    }
    const delta_x: number = this.from.getCentre().getX() * fraction * this.from_dir.getDeltaCol();
    const delta_y: number = this.from.getCentre().getY() * fraction * this.from_dir.getDeltaRow();
    new_position.setX(new_position.getX() + delta_x);
    new_position.setY(new_position.getY() + delta_y);
  }


  public getFrom(): Block {
    return this.from;
  }


  public getFromDirection(): Direction {
    return this.from_dir || this.from.getCentre().directionNearest(this.to.getCentre());
  }


  public getTo(): Block {
    return this.to;
  }


  public getToDirection(): Direction {
    return this.to_dir || this.to.getCentre().directionNearest(this.from.getCentre());
  }


  public output(): string {
    return `${(this.from_dir || "")} to ${this.to} ${(this.to_dir || "")}`;
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
