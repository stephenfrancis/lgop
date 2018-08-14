
import Diagram from "../core/Diagram";
import MapLoaderFile from "../loaders/MapLoaderFile";
import BellmanFord from "../layout/BellmanFord";
import Scale from "../layout/Scale";


test("readMars", () => {
  const diagram = new Diagram();
  const loader = new MapLoaderFile(diagram);
  loader.readFile("public/phobos.md");
  const bf: BellmanFord = new BellmanFord();
  bf.layoutDiagram(diagram);
  const sc: Scale = new Scale();
  sc.layoutDiagram(diagram);
  console.log(diagram.output());
});
