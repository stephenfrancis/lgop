
import BellmanFord from "../layout/BellmanFord";
import Diagram from "../core/Diagram";
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

const sc: Scale = new Scale("cell");
sc.beginDiagram(diagram);
while (sc.iterate());

const le: Lee = new Lee();
le.beginDiagram(diagram);
while (le.iterate());

// console.log(le.output());

// console.log(diagram.output());
