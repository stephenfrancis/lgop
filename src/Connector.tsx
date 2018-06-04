
import * as React from "react";
import RootLog from "loglevel";
import Block from "./Block";
import Direction from "./Direction";

const Log = RootLog.getLogger("lgop.Connector");

export default class Connector {
  private from: Block;
  private from_dir?: Direction;
  private to: Block;
  private to_dir?: Direction;

  constructor(from: Block, to: Block, from_dir?: Direction, to_dir?: Direction) {
    this.from = from;
    this.from_dir = from_dir;
    this.to = to;
    this.to_dir = to_dir;
  }


  public getFrom(): Block {
    return this.from;
  }


  public getFromDirection(): Direction {
    return this.from_dir || this.from.getCentre().directionNearest(this.to.getCentre());
  }


  public getTo(): Block {
    return this.to;
  }


  public getToDirection(): Direction {
    return this.to_dir || this.to.getCentre().directionNearest(this.from.getCentre());
  }

}
