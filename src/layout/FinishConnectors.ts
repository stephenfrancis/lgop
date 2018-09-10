
import Block from "../core/Block";
import Diagram from "../core/Diagram";
import Direction from "../core/Direction";
import Connector from "../core/Connector";
import LineSegment from "../core/LineSegment";
import Point from "../core/Point";
import Vector from "../core/Vector";



export default class FinishConnectors {

  constructor() {}


  public doBlock(block: Block): void {
    block.getConnectors().forEach((connector: Connector) => {
      this.doConnector(connector);
    });
  }


  public doConnector(connector: Connector): void {
    let first_line: LineSegment = null;
    let  last_line: LineSegment = null;
    const from_dir: Direction = connector.getFromDirection();
    const to_dir: Direction = connector.getToDirection();
    const from_anchor: Point = connector.getFrom().getAnchorPoint(from_dir);
    const to_anchor: Point = connector.getTo().getAnchorPoint(to_dir);
    connector.forEachLineSegment((line: LineSegment) => {
      if (!first_line) {
        first_line = line;
      }
      last_line = line;
    });
    connector.addLineSegment(new LineSegment(from_anchor, first_line.getFrom()));
    const v: Vector = Vector.between(to_anchor, last_line.getTo());
    connector.addLineSegment(new LineSegment(last_line.getTo(), to_anchor, null, v.getBearing() + 180));
    // this.output();
  }


  public layoutDiagram(diagram: Diagram): void {
    diagram.forEachBlock((block: Block) => {
      this.doBlock(block);
    });
  }

}
