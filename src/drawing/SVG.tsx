
import * as React from "react";
import * as Uuidv4 from "uuid/v4";
import Block from "../core/Block";
import Connector from "../core/Connector";
import Diagram from "../core/Diagram";
import Direction from "../core/Direction";
import Point from "../core/Point";
import LineSegment from "../core/LineSegment";


export default class SVG {

  constructor() {}


  public drawBlock(block: Block): JSX.Element {
    const elmt_id = Uuidv4();
    const link_url = block.getLink();
    const hover_text = block.getHoverText();
    // console.log(`SVG.drawBlock ${block}`);
    if (link_url) {
      return (
        <a href={link_url} key={"anchor_" + elmt_id} title={hover_text}>
          {this.drawRectangle(block.getCentre(), block.getHeight(), block.getWidth())}
          {this.drawText(block.getCentre(), block.getHeight(), block.getWidth(), block.getName())}
        </a>
      );
    } else {
      return (
        <g key={"group_" + elmt_id}>
          {this.drawRectangle(block.getCentre(), block.getHeight(), block.getWidth())}
          {this.drawText(block.getCentre(), block.getHeight(), block.getWidth(), block.getName())}
        </g>
      );
    }
  }


  public drawBlockConnectors(block: Block): JSX.Element {
    const children: Array<JSX.Element> = [];
    const elmt_id = Uuidv4();
    block.getConnectors().forEach(connector => {
      // console.log(`adding svg for connector: ${connector}`)
      children.push(this.drawConnector(connector));
    });
    return (
      <g key={elmt_id}>{children}</g>
    );
  }


  public drawDiagram(diagram: Diagram): JSX.Element {
    const children: JSX.Element[] = [];
    // iterated separately, to ensure all connectors lie over all blocks
    diagram.forEachBlock((block) => {
      children.push(this.drawBlock(block));
    });
    diagram.forEachBlock((block) => {
      children.push(this.drawBlockConnectors(block));
    });
    return (
      <svg
        height={diagram.getMaxY()}
        version="1.1"
        width={diagram.getMaxX()}
        xmlns="http://www.w3.org/2000/svg">
        {children}
      </svg>
    );
  }


  public drawRectangle(centre: Point, height: number, width: number): JSX.Element {
    if (!centre) {
      throw new Error(`block centre not defined`);
    }
    const elmt_id = Uuidv4();
    return (
      <rect
        x={centre.getX() - (width / 2)}
        y={centre.getY() - (height / 2)}
        width={width}
        height={height}
        key={"rect_" + elmt_id} />
    );
  }


  public drawText(centre: Point, height: number, width: number, text: string): JSX.Element {
    if (!centre) {
      throw new Error(`block centre not defined`);
    }
    const elmt_id = Uuidv4();
    return (
      <text
        x={centre.getX() - (width / 2) + 4}
        y={centre.getY() - (height / 2) + 16}
        key={"text_" + elmt_id}>{text}</text>
    );
  }


  public drawConnector(connector: Connector): JSX.Element {
    const children: JSX.Element[] = [];
    connector.forEachLineSegment((line: LineSegment) => {
      children.push(this.drawLine(line.getFrom(), line.getTo()));
      if (line.getArrowheadBearingTo()) {
        children.push(this.drawArrowHead(line.getTo(), line.getArrowheadBearingTo()));
      }
    });
    const elmt_id = Uuidv4();
    return (
      <g key={elmt_id}>
        {children}
      </g>
    );
  }


  public drawArrowHead(at: Point, rotate_angle: number): JSX.Element {
    const points: Array<Point> = [
      at,
      new Point(at.getX() - 3, at.getY() + 6),
      new Point(at.getX() + 3, at.getY() + 6),
    ];
    return this.drawPolygon(points, rotate_angle);
  }


  public drawLine(from: Point, to: Point): JSX.Element {
    const key = "line_" + Uuidv4();
    return (
      <line key={key}
        x1={from.getX()}
        y1={from.getY()}
        x2={to.getX()}
        y2={to.getY()} />
    );
  }


  public drawPolygon(points: Array<Point>, rotate_angle: number): JSX.Element {
    const key = "polygon_" + Uuidv4();
    let points_str: string = "";
    points.forEach((point) => {
      points_str += `${point.getX()}, ${point.getY()} `;
    });
    const transform = `rotate(${rotate_angle}, ${points[0].getX()}, ${points[0].getY()})`;
    return (
      <polygon key={key} points={points_str} transform={transform} />
    );
  }

}
