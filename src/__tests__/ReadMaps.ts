
import Diagram from "../core/Diagram";
import MapLoaderFile from "../loaders/MapLoaderFile";
import BellmanFord from "../layout/BellmanFord";
import Scale from "../layout/Scale";
import OverlapFixer from "../layout/OverlapFixer";


test("readMars", () => {
  const diagram = new Diagram();
  const loader = new MapLoaderFile(diagram);
  loader.readFile("public/mars.md");
  const bf: BellmanFord = new BellmanFord();
  bf.beginDiagram(diagram);
  while (bf.iterate());

  const of: OverlapFixer = new OverlapFixer();
  of.beginDiagram(diagram);
  while (of.iterate());
  // const sc: Scale = new Scale();
  // sc.layoutDiagram(diagram);
  console.log(diagram.output());
});
