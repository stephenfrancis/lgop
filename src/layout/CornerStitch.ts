
import Block from "../core/Block";
import Point from "../core/Point";


export default class CornerStitch  {
  private all_tiles: Tile[];
  private total_area: Area;
  private first_tile: Tile;

  constructor(bottom_right: Point) {
    this.all_tiles = [];
    this.total_area = new Area(new Point(0, 0), bottom_right);
    this.first_tile = new Tile(this.total_area);
  }


  public doesAreaContainBlock(top_left: Point, bottom_right: Point): boolean {
    const bottom_left: Point = new Point(top_left.getX(), bottom_right.getY());
    return this.findTileContaining(bottom_left).doesAreaContainBlock(top_left, bottom_right);
  }


  public findTileContaining(point: Point): Tile {
    return this.first_tile.findTileContaining(point);
  }


  public forEachTileInArea(top_left: Point, bottom_right: Point, callback: (tile: Tile) => void): void {
    const bottom_left: Point = new Point(top_left.getX(), bottom_right.getY());
    this.findTileContaining(bottom_left).forEachTileInArea(top_left, bottom_right, callback);
  }


  public getArea(): Area {
    return this.total_area;
  }


  public getFirstTile(): Tile {
    return this.first_tile;
  }


  public static test(): CornerStitch {
    const cs: CornerStitch = new CornerStitch(new Point(799, 599));
    const block_tile_1: Tile = new Tile(new Area(new Point(100, 100), new Point(299, 499)), new Block("Block 1"));
    const block_tile_2: Tile = new Tile(new Area(new Point(500, 200), new Point(599, 699)), new Block("Block 2"));

    const spacer_1 = cs.getFirstTile();
    spacer_1.setArea(new Area(spacer_1.getArea().getTopLeft(), new Point(799, 99)));
    block_tile_1.setCornerTileRef("lt", spacer_1);
    block_tile_1.setCornerTileRef("rt", spacer_1);

    const spacer_2 = new Tile(new Area(new Point(0, 100), new Point(99, 500)));
    spacer_1.setCornerTileRef("lb", spacer_2);
    spacer_2.setCornerTileRef("lt", spacer_1);
    spacer_2.setCornerTileRef("rt", spacer_1);
    spacer_2.setCornerTileRef("tr", block_tile_1);
    block_tile_1.setCornerTileRef("tl", spacer_2);
    spacer_2.setCornerTileRef("br", block_tile_1);
    block_tile_1.setCornerTileRef("bl", spacer_2);

    const spacer_3 = new Tile(new Area(new Point(300, 100), new Point(799, 199)));
    spacer_1.setCornerTileRef("rb", spacer_3);
    spacer_3.setCornerTileRef("rt", spacer_1);
    spacer_3.setCornerTileRef("lt", spacer_1);
    spacer_3.setCornerTileRef("tl", block_tile_1);
    block_tile_1.setCornerTileRef("tr", spacer_3);
    spacer_3.setCornerTileRef("bl", block_tile_1);

    return cs;
  }
}


export class Area {
  private bottom_right: Point;
  private top_left: Point;

  constructor(top_left: Point, bottom_right?: Point) {
    this.top_left = top_left;
    this.bottom_right = bottom_right;
  }


  public contains(point: Point): boolean {
    return (this.top_left    .getX() <= point.getX())
      &&   (this.top_left    .getY() <= point.getY())
      &&   (this.bottom_right.getX() >= point.getX())
      &&   (this.bottom_right.getY() >= point.getY());
  }


  public getBottomRight(): Point {
    return this.bottom_right;
  }


  public getTopLeft(): Point {
    return this.top_left;
  }


  public isContainedBy(area: Area): boolean {
    return (this.top_left    .getX() >= area.getTopLeft()    .getX())
      &&   (this.top_left    .getY() >= area.getTopLeft()    .getY())
      &&   (this.bottom_right.getX() <= area.getBottomRight().getX())
      &&   (this.bottom_right.getY() <= area.getBottomRight().getY());
  }


  public overlaps(area: Area): boolean {
    return ((this.top_left    .getX() <= area.getBottomRight().getX())
        ||  (area.getTopLeft().getX() <= this.bottom_right    .getX()))
      &&   ((this.top_left    .getY() <= area.getBottomRight().getY())
        ||  (area.getTopLeft().getY() <= this.bottom_right    .getY()));
  }


  public toString(): string {
    return `${this.getTopLeft()} / ${this.getBottomRight()}`;
  }

}


export class Tile {
  private area: Area;
  private block: Block;
  private tl: Tile;
  private tr: Tile;
  private bl: Tile;
  private br: Tile;
  private lt: Tile;
  private rt: Tile;
  private lb: Tile;
  private rb: Tile;

  constructor(area: Area, block?: Block) {
    this.area = area;
    this.block = block;
  }


  public contains(point: Point): boolean {
    return                      (this.area.getTopLeft()    .getX() <= point.getX())
      &&                        (this.area.getTopLeft()    .getY() <= point.getY())
      && (!this.area.getBottomRight() || (this.area.getBottomRight().getX() >= point.getX()))
      && (!this.area.getBottomRight() || (this.area.getBottomRight().getY() >= point.getY()));
  }


  public doesAreaContainBlock(top_left: Point, bottom_right: Point): boolean {
    if (this.block) {
      return true;
    } else if (top_left.getY() < this.area.getTopLeft().getY()) {
      return false;
    } else if (this.tr && (this.tr.area.getTopLeft().getX() < bottom_right.getX()) && this.tr.block) {
      return true;
    } else if (this.lt && (this.lt.area.getBottomRight().getY() > top_left.getY())) {
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


  private forEachNeighbourAlongSide(start: Tile, end: Tile, dir: string, callback: (tile: Tile) => void): void {
    let neighbour: Tile = start;
    do {
      callback(neighbour);
      neighbour = neighbour[dir];
    } while (neighbour !== end);
  }


  public forEachTileInArea(top_left: Point, bottom_right: Point, callback: (tile: Tile) => void): void {
    callback(this);
  }


  public findTileContaining(point: Point): Tile {
    if (point.getY() < this.area.getTopLeft().getY()) {
      return (this.lt && this.lt.findTileContaining(point));
    } else if (point.getY() > this.area.getBottomRight().getY()) {
      return (this.lb && this.lb.findTileContaining(point));
    } else if (point.getX() < this.area.getTopLeft().getX()) {
      return (this.bl && this.bl.findTileContaining(point));
    } else if (point.getX() > this.area.getBottomRight().getX()) {
      return (this.br && this.br.findTileContaining(point));
    } else {
      return this;
    }
  }


  public getArea(): Area {
    return this.area;
  }


  public getBlock(): Block {
    return this.block;
  }


  public setArea(area: Area): void {
    this.area = area;
  }


  public setCornerTileRef(ref: string, tile: Tile): void {
    if (!/^[tbrl]{2}$/.exec(ref)) {
      throw new Error(`invalid corner tile ref: ${ref}`);
    }
    this[ref] = tile;
  }


  public toString(): string {
    return `{${this.area} / ${this.block || "spacer"}}`;
  }

}
