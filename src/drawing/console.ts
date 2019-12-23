
import * as Diagram from "diagram-api";
import * as SVG from "svg-api";


const domain = new Diagram.Domain();
const loader = new Diagram.MapLoader(domain);
loader.readFile("public/mars.md");

const bf: Diagram.BellmanFord = new Diagram.BellmanFord();
bf.beginDomain(domain);
while (bf.iterate());

const of: Diagram.OverlapFixer = new Diagram.OverlapFixer();
of.beginDomain(domain);
while (of.iterate());

const sc: Diagram.Scale = new Diagram.Scale("double_cell");
sc.beginDomain(domain);
while (sc.iterate());

console.log(domain.output());

const le: Diagram.Lee = new Diagram.Lee();
le.beginDomain(domain);
while (le.iterate());

const s2: Diagram.Scale = new Diagram.Scale("svg");
s2.beginDomain(domain);
while (s2.iterate());

const fc: Diagram.FinishConnectors = new Diagram.FinishConnectors();
fc.layoutDomain(domain);

// console.log(le.output("lines_vert"));

// console.log(diagram.output());

const fm = new SVG.FileManager("./dist");
fm.saveAsSVG(domain.draw(), "lee");
