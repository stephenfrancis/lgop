
import * as React from "react";
import * as Fs from "fs";
import { renderToString } from "react-dom/server";
import CornerStitch, { Tile } from "../layout/CornerStitch";
import DrawCornerStitch from "../drawing/DrawCornerStitch";


const cs: CornerStitch = CornerStitch.test();

const draw: DrawCornerStitch = new DrawCornerStitch(cs);

const head = '<!DOCTYPE html>'
  + '<html lang="en">'
  +   '<head>'
  +     '<title>Corner Stitch Test</title>'
  +     '<meta charset="utf-8">'
  +     '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />'
  +     '<meta name="author" content="Stephen Francis">'
  +     '<meta http-equiv="X-UA-Compatible" content="IE=edge" />'
  +     '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />'
  +     '<link rel="stylesheet" href="../public/svg.css" />'
  +   '</head>'
  +   '<body>'
  +     '<h1>Corner Stitch Test</h1>';
const foot = "</body></html>";

Fs.writeFileSync("./dist/cs.html", head + renderToString(draw.draw()) + foot, {
  encoding: "utf8",
});

cs.checkStitches();

cs.sweep((tile: Tile) => {
  console.log(`sweep at ${tile}`);
})

// console.log(renderToString(draw.draw()));
