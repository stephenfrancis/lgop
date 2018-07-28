
import * as React from "react";
import RootLog from "loglevel";
import Cell from "./Cell";
import Location from "./Location";
// import Draw from "./Draw";

const Log = RootLog.getLogger("lgop.Map");


export default class Map {
  private first_location: Location;
  private id: string;
  private title: string;

  constructor(id: string, content: string) {
    this.id = id;
    Location.clear();
    Cell.clear();
    this.parseContent(content);
    Cell.report();
  }


  public getFirstLocation(): Location {
    return this.first_location;
  }


  public getSVG(): JSX.Element {
    return (
      <svg height="800" version="1.1" width="1200" xmlns="http://www.w3.org/2000/svg">
        {this.first_location.draw()}
      </svg>
    );
  }


  public getTitle(): string {
    return this.title;
  }


  private isDirection(line: string, parse_state: any): boolean {
    let match = line.match(/^ {2}\* (N|NE|E|SE|S|SW|W|NW|U|D):(.*)$/);
    if (match && match.length > 2 && parse_state.location) {
      parse_state.location.addDirection(match[1], match[2]);
      return true;
    }
    match = line.match(/^ {2}\* C:\s*\[(.*?)\]\((.*)\)$/);
    if (match && match.length > 2 && parse_state.location) {
      parse_state.location.addLink(match[2], match[1]);
    }
    return false;
  }


  private isLocation(line: string, parse_state: any): boolean {
    let match = line.match(/^\* (.*)$/);
    if (match && match.length > 1) {
      parse_state.location = Location.getLocation(match[1]);
      if (!this.first_location) {
        this.first_location = parse_state.location;
        this.first_location.setPosition(0, 0, 0);
      }
      return true;
    }
    return false;
  }

  private isTitle(line: string, parse_state: any): boolean {
    const match = line.match(/^# (.*)/);
    if (match) {
      this.title = match[1];
    }
    return !!match;
  }


  private parseContent(content: string) {
    const that = this;
    const lines = content.split(/\r\n|\n/);
    const parse_state = {
      inside_room: false,
    }
    lines.forEach(function (line) {
      let done = false;
      done = done || that.isDirection(line, parse_state);
      done = done || that.isLocation(line, parse_state);
      done = done || that.isTitle(line, parse_state);
      if (!done) {
        that.reportError("unused line: " + line);
      }
    });
  }


  private reportError(str: string): void {
    console.log(this.id + ": " + str); // eslint-disable-line no-console
  }

}
