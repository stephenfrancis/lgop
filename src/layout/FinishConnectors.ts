
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
    connector.forEachLineSegment((line: LineSegment) => {
      if (!first_line) {
        first_line = line;
      }
      last_line = line;
    });
    if (first_line) {
      const from_dir: Direction = connector.getFromDirection();
      const from_anchor: Point = connector.getFrom().getAnchorPoint(from_dir);
      first_line.setFrom(from_anchor);
    }
    if (last_line) {
      const to_dir: Direction = connector.getToDirection();
      const to_anchor: Point = connector.getTo().getAnchorPoint(to_dir);
      const v: Vector = Vector.between(to_anchor, last_line.getTo());
      last_line.setTo(to_anchor);
      last_line.setArrowheadBearingTo(v.getBearing());
    }
  }


  public layoutDiagram(diagram: Diagram): void {
    diagram.forEachBlock((block: Block) => {
      this.doBlock(block);
    });
  }

}
