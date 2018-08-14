
import Connector from "./Connector";
import Direction from "./Direction";
import Point from "./Point";

export default class Block {
  private centre: Point;
  private connectors: Connector[];
  private height: number = 24;
  private link_url: string;
  private name: string;
  private width: number = 120;


  constructor(name: string) {
    this.connectors = [];
    this.centre = new Point(0, 0);
    this.name = name;
  }


  public addConnector(to: Block, from_dir?: Direction, to_dir?: Direction): Connector {
    const conn: Connector = new Connector(this, to, from_dir, to_dir);
    this.connectors.push(conn);
    return conn;
  }


  public getConnectors(): Connector[] {
    return this.connectors;
  }


  public getAnchorPoint(dir: Direction): Point {
    const point: Point = new Point(
      this.centre.getX() + (this.width * dir.getAnchorPointFractionX()),
      this.centre.getY() + (this.height * dir.getAnchorPointFractionY())
    );
    return point;
  }


  public getCentre(): Point {
    return this.centre;
  }


  public getHeight(): number {
    return this.height;
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

  public setHeight(height: number): void {
    this.height = height;
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
