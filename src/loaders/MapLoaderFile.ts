
import * as Fs from "fs";
import Diagram from "../core/Diagram";
import MapLoader from "./MapLoader";

export default class MapLoaderFile extends MapLoader {

  constructor(diagram: Diagram) {
    super(diagram);
  }


  public readFile(filename: string) {
    const data = Fs.readFileSync(filename, {
      encoding: "UTF-8",
    });
    this.parseContent(data);
  }

}
