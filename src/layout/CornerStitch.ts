
import Point from "../core/Point";

export default class CornerStitch  {
  private tiles: Tile[];
  private tiles_by_y_pos: Tile[][];

  constructor() {
    this.tiles = [];
    this.tiles_by_y_pos = [];
    this.addTile(new Tile(new Point(0, 9)));
  }


  private addTile(tile: Tile): void {
    this.tiles.push(tile);
  }


  public findTileContaining(point: Point): Tile {
    let out: Tile;
    this.tiles.forEach((tile: Tile) => {
      if (tile.contains(point)) {
        out = tile;
      }
    });
    return out;
  }

}


export class Tile {
  private top_left: Point;
  private bottom_right: Point;

  constructor(top_left: Point, bottom_right?: Point) {
    this.top_left = top_left;
    this.bottom_right = bottom_right;
  }


  public contains(point: Point): boolean {
    return                      (this.top_left    .getX() <= point.getX())
      &&                        (this.top_left    .getY() <= point.getY())
      && (!this.bottom_right || (this.bottom_right.getX() >= point.getX()))
      && (!this.bottom_right || (this.bottom_right.getY() >= point.getY()));
  }


  public getTopLeft(): Point {
    return this.top_left;
  }


  public getBottomRight(): Point {
    return this.bottom_right;
  }


  public makeNewTileInside(top_left: Point, bottom_right: Point): Tile {
    if (!this.contains(top_left) || !this.contains(bottom_right)) {
      throw new Error(`point ${top_left} and ${bottom_right} don't both lie inside this tile ${this}`);
    }
    const main_new_tile: Tile = new Tile(top_left, bottom_right);
    let todo_left: boolean = false;
    if (top_left.getY() > this.top_left.getY()) { // this tile shortens heightways upwards
      this.setBottomRight(new Point(this.bottom_right.getX(), top_left.getY() - 1));
      todo_left = true;
    } else if (top_left.getX() > this.top_left.getX()) { // this tile shortens widthways leftwards
      this.setBottomRight(new Point(top_left.getX() - 1, this.bottom_right.getY()));
    } else if (bottom_right.getX() < this.bottom_right.getX()) {

    }
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