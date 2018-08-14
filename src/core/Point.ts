
import Direction from "./Direction";


export default class Point {
  private x: number;
  private y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }


  public bearingOf(to: Point): number {
    const delta_x = to.x - this.x;
    const delta_y = to.y - this.y;
    let out = Math.atan2(delta_x, -delta_y) * 180 / Math.PI;
    if (out < 0) {
      out += 360;
    }
    console.log(`bearingOf() dx: ${delta_x}, dy: ${delta_y} => ${out}`);
    return out;
  }


  public directionNearest(to: Point): Direction {
    return Direction.nearest(this.bearingOf(to));
  }


  public distanceOf(to: Point): number {
    return Math.sqrt(Math.pow(to.x - this.x, 2) + Math.pow(to.y - this.y, 2));
  }


  public getX(): number {
    return this.x;
  }


  public getY(): number {
    return this.y;
  }


  public setTo(point: Point): void {
    this.x = point.getX();
    this.y = point.getY();
  }


  public setX(x: number): void {
    this.x = x;
  }


  public setY(y: number): void {
    this.y = y;
  }


  public toString(): string {
    return `[${this.x}, ${this.y}]`;
  }

}

