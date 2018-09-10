
import BellmanFord from "../layout/BellmanFord";
import Diagram from "../core/Diagram";
import FileOutput from "../drawing/FileOutput";
import FinishConnectors from "../layout/FinishConnectors";
import Lee from "../layout/Lee";
import MapLoaderFile from "../loaders/MapLoaderFile";
import OverlapFixer from "../layout/OverlapFixer";
import Scale from "../layout/Scale";


const diagram = new Diagram();
const loader = new MapLoaderFile(diagram);
loader.readFile("public/mars.md");

const bf: BellmanFord = new BellmanFord();
bf.beginDiagram(diagram);
while (bf.iterate());

const of: OverlapFixer = new OverlapFixer();
of.beginDiagram(diagram);
while (of.iterate());

const sc: Scale = new Scale("double_cell");
sc.beginDiagram(diagram);
while (sc.iterate());

console.log(diagram.output());

const le: Lee = new Lee();
le.beginDiagram(diagram);
while (le.iterate());

const s2: Scale = new Scale();
s2.beginDiagram(diagram);
while (s2.iterate());

const fc: FinishConnectors = new FinishConnectors();
fc.layoutDiagram(diagram);

// console.log(le.output());

// console.log(diagram.output());

const fo: FileOutput = new FileOutput(diagram);
fo.write("./dist/lee.html");

