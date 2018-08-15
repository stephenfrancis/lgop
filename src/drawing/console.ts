
import Diagram from "../core/Diagram";
import MapLoaderFile from "../loaders/MapLoaderFile";
import BellmanFord from "../layout/BellmanFord";
import Scale from "../layout/Scale";
import OverlapFixer from "../layout/OverlapFixer";


const diagram = new Diagram();
const loader = new MapLoaderFile(diagram);
loader.readFile("public/mars.md");
const bf: BellmanFord = new BellmanFord();
bf.layoutDiagram(diagram);

const of: OverlapFixer = new OverlapFixer();
of.layoutDiagram(diagram);
// const sc: Scale = new Scale();
// sc.layoutDiagram(diagram);
console.log(diagram.output());
