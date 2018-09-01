
import Block from "../core/Block";
import Point from "../core/Point";


export default class CornerStitch  {
  private all_tiles: Tile[];
  private total_area: Area;
  private first_tile: Tile;

  constructor(bottom_right: Point) {
    this.all_tiles = [];
    this.total_area = new Area(new Point(0, 0), bottom_right);
    this.first_tile = this.addTile(this.total_area);
  }


  public addTile(area: Area, block?: Block): Tile {
    const tile: Tile = new Tile(area, block);
    this.all_tiles.push(tile);
    return tile;
  }


  public checkStitches(): void {
    this.all_tiles.forEach((tile: Tile) => {
      tile.checkStitches();
    });
  }


  public doesAreaContainBlock(top_left: Point, bottom_right: Point): boolean {
    const bottom_left: Point = new Point(top_left.getX(), bottom_right.getY());
    return this.findTileContaining(bottom_left).doesAreaContainBlock(top_left, bottom_right);
  }


  public findTileContaining(point: Point): Tile {
    return this.first_tile.findTileContaining(point);
  }


  public forEachTile(callback: (tile: Tile) => void): void {
    this.all_tiles.forEach(callback);
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


  public sweep(callback: (tile: Tile) => void): void {
    this.findTileContaining(new Point(999, 499)).sweep("l", Number.POSITIVE_INFINITY, callback);
  }


  public static test(): CornerStitch {
    const cs: CornerStitch = new CornerStitch(new Point(1000, 500));
    const block_tile_1: Tile = cs.addTile(new Area(new Point(200, 100), new Point(399, 299)), new Block("Block 1"));
    const block_tile_2: Tile = cs.addTile(new Area(new Point(600, 200), new Point(799, 399)), new Block("Block 2"));

    const spacer_1 = cs.getFirstTile();
    spacer_1.setArea(new Area(spacer_1.getArea().getTopLeft(), new Point(999, 99)));
    // block_tile_1.setCornerTileRef("lt", spacer_1);
    // block_tile_1.setCornerTileRef("rt", spacer_1);

    const spacer_2 = cs.addTile(new Area(new Point(0, 100), new Point(199, 299)));
    // spacer_1.setCornerTileRef("lb", spacer_2);
    // spacer_2.setCornerTileRef("lt", spacer_1);
    // spacer_2.setCornerTileRef("rt", spacer_1);
    // spacer_2.setCornerTileRef("tr", block_tile_1);
    // block_tile_1.setCornerTileRef("tl", spacer_2);
    // spacer_2.setCornerTileRef("br", block_tile_1);
    // block_tile_1.setCornerTileRef("bl", spacer_2);

    const spacer_3 = cs.addTile(new Area(new Point(400, 100), new Point(999, 199)));
    // spacer_1.setCornerTileRef("rb", spacer_3);
    // spacer_3.setCornerTileRef("rt", spacer_1);
    // spacer_3.setCornerTileRef("lt", spacer_1);
    // spacer_3.setCornerTileRef("tl", block_tile_1);
    // block_tile_1.setCornerTileRef("tr", spacer_3);
    // spacer_3.setCornerTileRef("bl", block_tile_1);

    const spacer_4 = cs.addTile(new Area(new Point(400, 200), new Point(599, 299)));
    // spacer_4.setCornerTileRef("lt", spacer_3);
    // spacer_3.setCornerTileRef("lb", spacer_4);
    // spacer_4.setCornerTileRef("rt", spacer_3);

    const spacer_5 = cs.addTile(new Area(new Point(800, 200), new Point(999, 399)));

    const spacer_6 = cs.addTile(new Area(new Point(0, 300), new Point(599, 399)));

    const spacer_7 = cs.addTile(new Area(new Point(0, 400), new Point(999, 499)));

    spacer_1.setAllCornerTiles(null, null, null, null, spacer_3, spacer_2, null, null);
    spacer_2.setAllCornerTiles(spacer_1, spacer_1, block_tile_1, block_tile_1, spacer_6, spacer_6, null, null);
    block_tile_1.setAllCornerTiles(spacer_1, spacer_1, spacer_3, spacer_4, spacer_6, spacer_6, spacer_2, spacer_2);
    spacer_3.setAllCornerTiles(spacer_1, spacer_1, null, null, spacer_5, spacer_4, block_tile_1, block_tile_1);
    spacer_4.setAllCornerTiles(spacer_3, spacer_3, block_tile_2, block_tile_2, spacer_6, spacer_6, block_tile_1, block_tile_1);
    block_tile_2.setAllCornerTiles(spacer_3, spacer_3, spacer_5, spacer_5, spacer_7, spacer_7, spacer_6, spacer_4);
    spacer_5.setAllCornerTiles(spacer_3, spacer_3, null, null, spacer_7, spacer_7, block_tile_2, block_tile_2);
    spacer_6.setAllCornerTiles(spacer_2, spacer_4, block_tile_2, block_tile_2, spacer_7, spacer_7, null, null);
    spacer_7.setAllCornerTiles(spacer_6, spacer_5, null, null, null, null, null, null);
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


  private checkStitch(locn: string, dir: string, tile?: Tile): void {
    if (!tile) {
      if (dir === "l" && this.getMinX() > 0) console.log(`ERROR: ${this} missing ${locn}${dir}`);
      if (dir === "r" && this.getMaxX() < 999) console.log(`ERROR: ${this} missing ${locn}${dir}`);
      if (dir === "t" && this.getMinY() > 0) console.log(`ERROR: ${this} missing ${locn}${dir}`);
      if (dir === "b" && this.getMaxY() < 499) console.log(`ERROR: ${this} missing ${locn}${dir}`);
      return;
    }
    if ((dir === "l") && (this.getMinX() - 1) !== tile.getMaxX()) console.log(`ERROR: ${this} ${locn}l not adjacent to ${tile} `);
    if ((dir === "r") && (this.getMaxX() + 1) !== tile.getMinX()) console.log(`ERROR: ${this} ${locn}r not adjacent to ${tile} `);
    if ((dir === "t") && (this.getMinY() - 1) !== tile.getMaxY()) console.log(`ERROR: ${this} ${locn}t not adjacent to ${tile} `);
    if ((dir === "b") && (this.getMaxY() + 1) !== tile.getMinY()) console.log(`ERROR: ${this} ${locn}b not adjacent to ${tile} `);
    if ((locn === "l") && (tile.getMinX() > this.getMinX() || tile.getMaxX() < this.getMinX())) console.log(`ERROR: ${this} l${dir} not aligned to ${tile} `);
    if ((locn === "r") && (tile.getMinX() > this.getMaxX() || tile.getMaxX() < this.getMaxX())) console.log(`ERROR: ${this} r${dir} not aligned to ${tile} `);
    if ((locn === "t") && (tile.getMinY() > this.getMinY() || tile.getMaxY() < this.getMinY())) console.log(`ERROR: ${this} t${dir} not aligned to ${tile} `);
    if ((locn === "b") && (tile.getMinY() > this.getMaxY() || tile.getMaxY() < this.getMaxY())) console.log(`ERROR: ${this} b${dir} not aligned to ${tile} `);
  }


  public checkStitches(): void {
    console.log(`checking stitches for tile ${this}`);
    this.checkStitch("b", "l", this.bl);
    this.checkStitch("b", "r", this.br);
    this.checkStitch("r", "t", this.rt);
    this.checkStitch("r", "b", this.rb);
    this.checkStitch("t", "l", this.tl);
    this.checkStitch("t", "r", this.tr);
    this.checkStitch("l", "t", this.lt);
    this.checkStitch("l", "b", this.lb);
  }


  public doesAreaContainBlock(top_left: Point, bottom_right: Point): boolean {
    if (this.block) {
      return true;
    } else if (top_left.getY() < this.getMinY()) {
      return false;
    } else if (this.tr && (this.tr.getMinX() < bottom_right.getX()) && this.tr.block) {
      return true;
    } else if (this.lt && (this.lt.getMaxY() > top_left.getY())) {
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


  public getMaxX(): number {
    return this.area.getBottomRight().getX();
  }


  public getMaxY(): number {
    return this.area.getBottomRight().getY();
  }


  public getMinX(): number {
    return this.area.getTopLeft().getX();
  }


  public getMinY(): number {
    return this.area.getTopLeft().getY();
  }

  public setArea(area: Area): void {
    this.area = area;
  }


  public setAllCornerTiles(lt?: Tile, rt?: Tile, tr?: Tile, br?: Tile, rb?: Tile, lb?: Tile, bl?: Tile, tl?: Tile) {
    this.lt = lt;
    this.rt = rt;
    this.tr = tr;
    this.br = br;
    this.rb = rb;
    this.lb = lb;
    this.bl = bl;
    this.tl = tl;
  }

  public setCornerTileRef(ref: string, tile: Tile): void {
    if (!/^[tbrl]{2}$/.exec(ref)) {
      throw new Error(`invalid corner tile ref: ${ref}`);
    }
    this[ref] = tile;
  }


  public sweep(dir: string, y_level: number, callback: (tile: Tile) => void): void {
    callback(this);
    const check_seq = {
      "r": [ "lb", "rb", "br", "tr", "rt", ],
      "l": [ "rb", "lb", "bl", "tl", "lt", ],
    }
    let next_tile: Tile = null;
    let i = 0;
    while (!next_tile && i < check_seq[dir].length) {
      let ith_tile = this[check_seq[dir][i]];
      if (ith_tile) {
        // console.log(`  testing ${dir} ${i} ${check_seq[dir][i]} --> ${ith_tile} ${ith_tile.getMaxY()}`)
        if (ith_tile.getMaxY() < y_level) {
          next_tile = ith_tile;
        }
      }
      i += 1;
    }
    if (next_tile) {
      if (i === 5) {
        y_level = Math.min(y_level, this.getMaxY());
        dir = (dir === "r") ? "l" : "r"; // swap direction
        console.log(`  turning... ${i} ${next_tile} ${y_level} ${dir}`)
    }
      next_tile.sweep(dir, y_level, callback);
    }
  }


  public toString(): string {
    return `{${this.area} / ${this.block || "spacer"}}`;
  }

}
