
import * as React from "react";
import CornerStitch, { Tile } from "../layout/CornerStitch";
import Point from "../core/Point";
import SVG from "./SVG";


export default class DrawCornerStitch {
  private corner_stitch: CornerStitch;
  private svg: SVG;

  constructor(corner_stitch: CornerStitch) {
    this.corner_stitch = corner_stitch;
    this.svg = new SVG();
  }


  public draw(): JSX.Element {
    const children: JSX.Element[] = [];
    const top_left: Point = this.corner_stitch.getArea().getTopLeft();
    const bottom_right: Point = this.corner_stitch.getArea().getBottomRight();
    // iterated separately, to ensure all connectors lie over all blocks
    this.corner_stitch.forEachTile((tile: Tile) => {
      children.push(this.svg.drawRect(tile.getArea().getTopLeft(), tile.getArea().getBottomRight()));
      children.push(this.svg.drawText(tile.getArea().getTopLeft(), tile.toString()));
    });
    return (
      <svg
        height={bottom_right.getY() - top_left.getY()}
        version="1.1"
        width={bottom_right.getX() - top_left.getX()}
        xmlns="http://www.w3.org/2000/svg">
        {children}
      </svg>
    );
  }

}
