
import Point from "./Point";


export default class LineSegment {
  private from: Point;
  private to: Point;
  private arrowhead_bearing_from: number;
  private arrowhead_bearing_to: number;


  constructor(from: Point, to: Point, ah_from?: number, ah_to?: number) {
    this.from = from;
    this.to = to;
    this.arrowhead_bearing_from = ah_from;
    this.arrowhead_bearing_to = ah_to;
  }


  public getFrom(): Point {
    return this.from;
  }


  public getTo(): Point {
    return this.to;
  }


  public getArrowheadBearingFrom(): number {
    return this.arrowhead_bearing_from;
  }


  public getArrowheadBearingTo(): number {
    return this.arrowhead_bearing_to;
  }

}
