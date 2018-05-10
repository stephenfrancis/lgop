

export default class Map {
  private first_location: Location;
  private id: string;
  private title: string;

  constructor(id: string, content: string) {
    this.id = id;
    this.parseContent(content);
  }


  public getFirstLocation(): Location {
    return this.first_location;
  }


  public getSVG(): string {
    return "<svg viewBox=\"0 0 220 100\" xmlns=\"http://www.w3.org/2000/svg\">"
      + (this.first_location && this.first_location.getSVG()) + "</svg>";
  }


  private isDirection(line: string, parse_state: any): boolean {
    let match = line.match(/^ {2}\* (N|NE|E|SE|S|SW|W|NW|U|D):(.*)$/);
    if (match && match.length > 2 && parse_state.location) {
      parse_state.location.addDirection(match[1], match[2]);
      return true;
    }
    return false;
  }


  private isLocation(line: string, parse_state: any): boolean {
    let match = line.match(/^\* (.*)$/);
    if (match && match.length > 1) {
      parse_state.location = Location.getLocation(match[1]);
      if (!this.first_location) {
        this.first_location = parse_state.location;
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


export class Location {
  private name: string;
  private directions: any;
  private static locations: any = {};
  private static direction_codes: Array<string> = [
    "N",
    "NE",
    "E",
    "SE",
    "S",
    "SW",
    "W",
    "NW",
    "U",
    "D",
  ];

  constructor(name: string) {
    this.name = name;
    this.directions = {};
  }


  public addDirection(direction: string, other_location: string) {
    if (Location.direction_codes.indexOf(direction) === -1) {
      throw new Error(`invalid direction code: ${direction}`);
    }
    if (this.directions[direction]) {
      throw new Error(`direction already specified: ${direction}`);
    }
    this.directions[direction] = Location.getLocation(other_location);
  }


  public getDirection(direction: string): Location {
    if (Location.direction_codes.indexOf(direction) === -1) {
      throw new Error(`invalid direction code: ${direction}`);
    }
    if (!this.directions[direction]) {
      throw new Error(`no location in this direction: ${direction}`);
    }
    return this.directions[direction];
  }


  public getDirections(): any {
    return this.directions;
  }


  public static getLocation(name: string) {
    if (!Location.locations[name]) {
      Location.locations[name] = new Location(name);
    }
    return Location.locations[name];
  }


  public getSVG(): string {
    return "<rect x=\"0\" y=\"0\" width=\"40\" height=\"20\" stroke=\"black\" fill=\"white\"><text  font-family=\"Verdana\" font-size=\"35\">" + this.name + "</text></rect>";
  }

}