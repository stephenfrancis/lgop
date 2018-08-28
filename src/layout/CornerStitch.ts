
import Block from "../core/Block";
import Point from "../core/Point";


export default class CornerStitch  {
  private first_tile: Tile;

  constructor() {
    this.first_tile = new Tile(new Point(0, 0));
  }


  public doesAreaContainBlock(top_left: Point, bottom_right: Point): boolean {
    const bottom_left: Point = new Point(top_left.getX(), bottom_right.getY());
    return this.findTileContaining(bottom_left).doesAreaContainBlock(top_left, bottom_right);
  }


  public findTileContaining(point: Point): Tile {
    return this.first_tile.findTileContaining(point);
  }


  public forEachTileInArea(top_left: Point, bottom_right: Point, callback: (tile: Tile) => {}): void {
    const bottom_left: Point = new Point(top_left.getX(), bottom_right.getY());
    this.findTileContaining(bottom_left).forEachTileInArea(top_left, bottom_right, callback);
  }
}


export class Tile {
  private block: Block;
  private bottom_right: Point;
  private top_left: Point;
  private tl: Tile;
  private tr: Tile;
  private bl: Tile;
  private br: Tile;
  private lt: Tile;
  private rt: Tile;
  private lb: Tile;
  private rb: Tile;

  constructor(top_left: Point, bottom_right?: Point, block?: Block) {
    this.top_left = top_left;
    this.bottom_right = bottom_right;
    this.block = block;
  }


  public contains(point: Point): boolean {
    return                      (this.top_left    .getX() <= point.getX())
      &&                        (this.top_left    .getY() <= point.getY())
      && (!this.bottom_right || (this.bottom_right.getX() >= point.getX()))
      && (!this.bottom_right || (this.bottom_right.getY() >= point.getY()));
  }


  public doesAreaContainBlock(top_left: Point, bottom_right: Point): boolean {
    if (this.block) {
      return true;
    } else if (top_left.getY() < this.top_left.getY()) {
      return false;
    } else if (this.tr && (this.tr.top_left.getX() < bottom_right.getX()) && this.tr.block) {
      return true;
    } else if (this.lt && (this.lt.bottom_right.getY() > top_left.getY())) {
      return this.lt.doesAreaContainBlock(top_left, bottom_right);
    } else {
      return false;
    }
  }


  public forEachNeighbour(callback: (tile: Tile) => {}): void {
    this.forEachNeighbourAlongSide(this.tr, this.br, "lb", callback); // right side
    this.forEachNeighbourAlongSide(this.rb, this.lb, "tl", callback); // bottom side
    this.forEachNeighbourAlongSide(this.bl, this.tl, "rt", callback); // left side
    this.forEachNeighbourAlongSide(this.lt, this.rt, "br", callback); // top side
  }


  private forEachNeighbourAlongSide(start: Tile, end: Tile, dir: string, callback: (tile: Tile) => {}): void {
    let neighbour: Tile = start;
    do {
      callback(neighbour);
      neighbour = neighbour[dir];
    } while (neighbour !== end);
  }


  public forEachTileInArea(top_left: Point, bottom_right: Point, callback: (tile: Tile) => {}): void {
    callback(this);
  }


  public findTileContaining(point: Point): Tile {
    if (point.getY() < this.top_left.getY()) {
      return (this.lt && this.lt.findTileContaining(point));
    } else if (point.getY() > this.bottom_right.getY()) {
      return (this.lb && this.lb.findTileContaining(point));
    } else if (point.getX() < this.top_left.getX()) {
      return (this.bl && this.bl.findTileContaining(point));
    } else if (point.getX() > this.bottom_right.getX()) {
      return (this.br && this.br.findTileContaining(point));
    } else {
      return this;
    }
  }


  public getTopLeft(): Point {
    return this.top_left;
  }


  public getBlock(): Block {
    return this.block;
  }


  public getBottomRight(): Point {
    return this.bottom_right;
  }


  public setBottomRight(point: Point): void {
    this.bottom_right = point;
  }


  public setTopLeft(point: Point): void {
    this.top_left = point;
  }


  public toString(): string {
    return `{${this.top_left} / ${this.bottom_right}}`;
  }

}
