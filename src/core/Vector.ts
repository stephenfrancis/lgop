
import Point from "./Point";


export default class Vector {
  private magnitude: number;
  private bearing: number; // 0 = North

  constructor(magnitude: number, bearing: number) {
    this.magnitude = magnitude;
    this.bearing = bearing;
  }


  public add(other_vector: Vector): void {
    const ap: Point = this.toPoint();
    const bp: Point = other_vector.toPoint();
    ap.add(bp);
    const new_v: Vector = Vector.fromOriginTo(ap);
    this.setTo(new_v);
  }


  public static between(a: Point, b: Point): Vector {
    const new_b: Point = b.clone();
    new_b.subtract(a);
    return Vector.fromOriginTo(new_b);
  }


  public clone(): Vector {
    return new Vector(this.magnitude, this.bearing);
  }


  public static fromOriginTo(point: Point): Vector {
    const x = point.getX();
    const y = point.getY();
    let bearing = Math.atan2(x, -y) * 180 / Math.PI;
    if (bearing < 0) {
      bearing += 360;
    }
    const magnitude = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    return new Vector(magnitude, bearing);
  }


  public getBearing(): number {
    return this.bearing;
  }


  public getMagnitude(): number {
    return this.magnitude;
  }


  public setBearing(bearing: number): void {
    this.bearing = bearing;
  }


  public setMagnitude(magnitude: number): void {
    this.magnitude = magnitude;
  }


  public setTo(vector: Vector): void {
    this.magnitude = vector.getMagnitude();
    this.bearing   = vector.getBearing();
  }


  public subtract(other_vector: Vector): void {
    const ap: Point = this.toPoint();
    const bp: Point = other_vector.toPoint();
    ap.subtract(bp);
    const new_v: Vector = Vector.fromOriginTo(ap);
    this.setTo(new_v);
  }


  public toPoint(): Point {
    let x: number =  (this.magnitude * Math.sin(this.bearing * Math.PI / 180));
    let y: number = -(this.magnitude * Math.cos(this.bearing * Math.PI / 180));
    return new Point(x, y);
  }


  public toString(): string {
    return `[${this.magnitude}, ${this.bearing}]`;
  }

}
