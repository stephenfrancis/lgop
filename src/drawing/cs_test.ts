
import * as React from "react";
import { renderToString } from "react-dom/server";
import CornerStitch from "../layout/CornerStitch";
import DrawCornerStitch from "../drawing/DrawCornerStitch";


const cs: CornerStitch = CornerStitch.test();

const draw: DrawCornerStitch = new DrawCornerStitch(cs);

console.log(renderToString(draw.draw()));
