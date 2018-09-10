
import * as Fs from "fs";
import { renderToString } from "react-dom/server";
import Diagram from "../core/Diagram";
import SVG from "./SVG";

const head1 = '<!DOCTYPE html>'
+ '<html lang="en">'
+   '<head>'
+     '<title>';
const head2 = '</title>'
+     '<meta charset="utf-8">'
+     '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />'
+     '<meta name="author" content="Stephen Francis">'
+     '<meta http-equiv="X-UA-Compatible" content="IE=edge" />'
+     '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />'
+     '<link rel="stylesheet" href="../public/svg.css" />'
+   '</head>'
+   '<body>'
+     '<h1>';
const head3 = '</h1>';
const foot = "</body></html>";


export default class FileOutput {
  private diagram: Diagram;
  private title: string;

  constructor(diagram: Diagram) {
    this.diagram = diagram;
    this.title = diagram.getTitle();
  }


  public setTitle(title: string): void {
    this.title = title;
  }


  public write(filename: string): void {
    const svg: SVG = new SVG();
    Fs.writeFileSync(filename,
        head1 + this.title + head2 + this.title + head3
         + renderToString(svg.drawDiagram(this.diagram))
         + foot, {
      encoding: "utf8",
    });
  }

}
