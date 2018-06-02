
import * as React from "react";
import RootLog from "loglevel";

const Log = RootLog.getLogger("lgop.Draw");

export enum Direction {
  N = "N",
  NE = "NE",
  E = "E",
  SE = "SE",
  S = "S",
  SW = "SW",
  W = "W",
  NW = "NW",
};

const direction_codes: any = {
  "N" : { col:  0, row: -1, z:  0, fx:  56, fy:  0, tx:  56, ty: 24, ang:   0, },
  "NE": { col:  1, row: -1, z:  0, fx: 120, fy:  0, tx:   0, ty: 24, ang:  45, },
  "E" : { col:  1, row:  0, z:  0, fx: 120, fy:  8, tx:   0, ty:  8, ang:  90, },
  "SE": { col:  1, row:  1, z:  0, fx: 120, fy: 24, tx:   0, ty:  0, ang: 135, },
  "S" : { col:  0, row:  1, z:  0, fx:  64, fy: 24, tx:  64, ty:  0, ang: 180, },
  "SW": { col: -1, row:  1, z:  0, fx:   0, fy: 24, tx: 120, ty:  0, ang: 225, },
  "W" : { col: -1, row:  0, z:  0, fx:   0, fy: 16, tx: 120, ty: 16, ang: 270, },
  "NW": { col: -1, row: -1, z:  0, fx:   0, fy:  0, tx: 120, ty: 24, ang: 315, },
  "U" : { col:  0, row:  0, z:  1, fx:  96, fy:  0, tx:  16, ty: 24, ang:  45, },
  "D" : { col:  0, row:  0, z: -1, fx:  24, fy: 24, tx: 104, ty:  0, ang: 225, },
};


const directions = [ "N", "NE", "E", "SE", "S", "SW", "W", "NW", ];

export interface Point {
  x: number;
  y: number;
}

export interface DirectedPoint extends Point {
  dir: string;
}

export default class Draw {
  private elements: Array<JSX.Element>;

  constructor() {
    this.elements = [];
  }


  public arrow(from: DirectedPoint, to: DirectedPoint): void {
    Log.debug(`arrow(from ${from.x}, ${from.y}, ${from.dir} to ${to.x} ${to.y} ${to.dir})`);
    if (!from.dir || from.dir === "auto") {
      throw new Error("from dir must be a compass point");
    }
    const delta = direction_codes[from.dir];
    this.movePoint(from, delta.fx, delta.fy);
    this.movePoint(  to, delta.tx, delta.ty);
    if (to.dir === "auto") {
      to.dir = this.compassPointNearest(this.bearingOf(from, to));
    }
    const from_shift = this.shift(from);
    const to_shift = this.shift(to);
    const elbow: Point = {
      x: from_shift.x,
      y: to_shift.y,
    };
    Log.debug(`  ${from.dir} ${to.dir} ${delta.ang} ${elbow.x} ${elbow.y}`);
    this.line(from_shift, elbow);
    this.line(elbow, to_shift);
    this.arrowHead(to, delta.ang);
  }


  public arrowHead(at: Point, rotate_angle: number): void {
    const points: Array<Point> = [
      at,
      { x: at.x - 3, y: at.y + 6, },
      { x: at.x + 3, y: at.y + 6, },
    ];
    this.polygon(points, rotate_angle);
  }


  public bearingOf(to: Point, from: Point): number {
    const delta_x = to.x - from.x;
    const delta_y = to.y - from.y;
    let out = Math.atan2(delta_x, -delta_y) * 180 / Math.PI;
    if (out < 0) {
      out += 360;
    }
    Log.info(`bearingOf() dx: ${delta_x}, dy: ${delta_y} => ${out}`);
    return out;
  }


  public box(top_left: Point, width: number, height: number, link_url: string): void {
    if (link_url) {
      const key = "anchor_" + this.elements.length;
      this.elements.push(
        <a href={link_url} key={key}>
          {this.boxInternal(top_left, width, height)}
        </a>
      );
    } else {
      this.elements.push(
        this.boxInternal(top_left, width, height)
      );
    }
  }


  public boxInternal(top_left: Point, width: number, height: number): JSX.Element {
    const key = "box_" + this.elements.length;
    return (
      <rect x={top_left.x} y={top_left.y} width={width} height={height} key={key} />
    );
  }


  public clear(): void {
    this.elements = [];
  }


  public compassPointNearest(bearing: number): string {
    return directions[Math.floor((bearing + 22.5) / 45) % 8];
  }


  private evaluateAutoDirections(from: DirectedPoint, to: DirectedPoint): void {
    if (from.dir === "auto") {
      from.dir = this.compassPointNearest(this.bearingOf(to, from));
    }
    if (to.dir === "auto") {
      to.dir = this.compassPointNearest(this.bearingOf(from, to));
    }
  }


  public getElements(): Array<JSX.Element> {
    return this.elements;
  }


  public line(from: Point, to: Point): void {
    const key = "line_" + this.elements.length;
    this.elements.push(<line key={key}
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y} />);
  }


  public movePoint(point: Point, dx?: number, dy?: number): void {
    point.x += (dx || 0);
    point.y += (dy || 0);
  }


  public polygon(points: Array<Point>, rotate_angle: number): void {
    const key = "polygon_" + this.elements.length;
    let points_str: string = "";
    points.forEach((point) => {
      points_str += `${point.x}, ${point.y} `;
    });
    const transform = `rotate(${rotate_angle}, ${points[0].x}, ${points[0].y})`;
    this.elements.push(
      <polygon key={key} points={points_str} transform={transform} />
    );

  }


  public shift(from: DirectedPoint): Point {
    Log.debug(`shift( ${JSON.stringify(from)})`)
    const ang = direction_codes[from.dir].ang;
    const len = 20;
    const to: Point = {
      x: from.x + (len * Math.sin(Math.PI * ang / 180)),
      y: from.y - (len * Math.cos(Math.PI * ang / 180)),
    };
    this.line(from, to);
    return to;
  }

/*
  public shiftFrom(from: DirectedPoint): Point {
    const delta = direction_codes[from.dir];
    const new_point: DirectedPoint = {
      x: from.x + delta.fx,
      y: from.y + delta.fx,
      dir: from.dir,
    };
    return this.shift(new_point);
  }


  public shiftTo(to: DirectedPoint): Point {
    const delta = direction_codes[to.dir];
    const new_point: DirectedPoint = {
      x: to.x + delta.tx,
      y: to.y + delta.tx,
      dir: to.dir,
    };
    return this.shift(new_point);
  }
*/

  public text(top_left: Point, text: string): void {
    const key = "text_" + this.elements.length;
    this.elements.push(
      <text x={top_left.x + 4} y={top_left.y + 16} key={key}>{text}</text>
    );
  }

}
