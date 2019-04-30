
import Connector from "./Connector";
import Direction from "./Direction";
import Point from "./Point";

export default class Block {
  private centre: Point;
  private connectors: Connector[];
  private height: number = 24;
  private hover_text: string;
  private link_url: string;
  private name: string;
  private width: number = 120;


  constructor(name: string, width?: number, height?: number, x?: number, y?: number) {
    this.connectors = [];
    this.centre = new Point(x || 0, y || 0);
    this.name = name;
    if (typeof width === "number") {
      this.setWidth(width);
    }
    if (typeof height === "number") {
      this.setHeight(height);
    }
  }


  public addConnector(to: Block, from_dir?: Direction, to_dir?: Direction): Connector {
    const conn: Connector = new Connector(this, to, from_dir, to_dir);
    this.connectors.push(conn);
    return conn;
  }


  public copy(): Block {
    const new_b: Block = new Block(this.getName(), this.getWidth(), this.getHeight(),
      this.getCentre().getX(), this.getCentre().getY());
    new_b.setHoverText(this.getHoverText());
    new_b.setLink(this.getLink());
    return new_b;
  }


  public getAnchorPoint(dir: Direction): Point {
    const point: Point = new Point(
      this.centre.getX() + (this.width  * dir.getAnchorPointFractionX()),
      this.centre.getY() + (this.height * dir.getAnchorPointFractionY())
    );
    return point;
  }


  public getCentre(): Point {
    return this.centre;
  }


  public getConnectors(): Connector[] {
    return this.connectors;
  }


  public getHeight(): number {
    return this.height;
  }


  public getHoverText(): string {
    return this.hover_text;
  }


  public getLink(): string {
    return this.link_url;
  }


  public getName(): string {
    return this.name;
  }


  public getWidth(): number {
    return this.width;
  }


  public output(): string {
    let out = this.toString();
    this.connectors.forEach((connector: Connector) => {
      out += "\n  " + connector.output();
    });
    return out;
  }


  public removeConnector(index: number): void {
    this.connectors.splice(index, 1);
  }


  public reset(): void {
    this.connectors.forEach((conn: Connector) => {
      conn.reset();
    });
  }


  public setCentre(point: Point): void {
    this.centre = point;
  }


  public setHeight(height: number): void {
    this.height = height;
  }


  public setHoverText(hover_text: string): void {
    this.hover_text = hover_text;
  }


  public setLink(link_url: string) {
    this.link_url = link_url;
  }


  public setWidth(width: number) {
    this.width = width;
  }


  public toString(): string {
    return `<${this.name}> at ${this.centre}`;
  }

}
