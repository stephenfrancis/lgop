
import Block from "../core/Block";
import Diagram from "../core/Diagram";
import Direction from "../core/Direction";
import Connector from "../core/Connector";
import LineSegment from "../core/LineSegment";
import Point from "../core/Point";
import Vector from "../core/Vector";



export default class SimpleConnectors {
  private sophistication: number;

  constructor(sophistication: number) {
    if (sophistication < 1 || sophistication > 4 || !Number.isInteger(sophistication)) {
      throw new Error(`sophistication should be an integer between 1 and 4, you gave ${sophistication}`);
    }
    this.sophistication = sophistication;
  }


  public doBlock(block: Block): void {
    block.getConnectors().forEach((connector: Connector) => {
      this.doConnector(connector);
    });
  }


  public doConnector(connector: Connector): void {
    connector.resetLineSegments();
    this["doLevel" + this.sophistication](connector);
  }


  public doLevel1(connector: Connector): void {
    const v: Vector = Vector.between(
      connector.getTo()  .getCentre(),
      connector.getFrom().getCentre());
    const line: LineSegment = new LineSegment(
      connector.getFrom().getCentre(),
      connector.getTo()  .getCentre(), null, v.getBearing() + 180);
    connector.addLineSegment(line);
  }


  public doLevel2(connector: Connector): void {
    const v: Vector = Vector.between(connector.getTo().getCentre(), connector.getFrom().getCentre());
    const   to_dir: Direction = Direction.nearest(v.getBearing());
    const from_dir: Direction = Direction.nearest(180 + v.getBearing());
    const from_anchor: Point = connector.getFrom().getAnchorPoint(from_dir);
    const to_anchor: Point = connector.getTo().getAnchorPoint(to_dir);
    connector.addLineSegment(new LineSegment(from_anchor, to_anchor, null, to_dir.getAngle() + 180));
  }


  public doLevel3(connector: Connector): void {
    const from_dir: Direction = connector.getFromDirection();
    const from_anchor: Point = connector.getFrom().getAnchorPoint(from_dir);
    const to_dir: Direction = connector.getToDirection();
    const to_anchor: Point = connector.getTo().getAnchorPoint(to_dir);
    connector.addLineSegment(new LineSegment(from_anchor, to_anchor, null, to_dir.getAngle() + 180));
  }


  public doLevel4(connector: Connector): void {
    const from_dir: Direction = connector.getFromDirection();
    const from_anchor: Point = connector.getFrom().getAnchorPoint(from_dir);
    const from_shift: Point = connector.shift(from_anchor, from_dir);
    const to_dir: Direction = connector.getToDirection();
    const to_anchor: Point = connector.getTo().getAnchorPoint(to_dir);
    const to_shift: Point = connector.shift(to_anchor, to_dir);
    const elbow: Point = new Point(from_shift.getX(), to_shift.getY());
    connector.addLineSegment(new LineSegment(from_anchor, from_shift));
    connector.addLineSegment(new LineSegment(from_shift, elbow));
    connector.addLineSegment(new LineSegment(elbow, to_shift));
    const v: Vector = Vector.between(to_anchor, to_shift);
    connector.addLineSegment(new LineSegment(to_shift, to_anchor, null, v.getBearing() + 180));
  }


  public layoutDiagram(diagram: Diagram): void {
    diagram.forEachBlock((block: Block) => {
      this.doBlock(block);
    });
  }

}
