
import Diagram from "../core/Diagram";
import MapLoader from "../loaders/MapLoader";
import BellmanFord from "../layout/BellmanFord";
import Scale from "../layout/Scale";


test("readMars", () => {
  const diagram = new Diagram();
  const loader = new MapLoader(diagram);
  loader.readFile("public/cleveland.md");
  const bf: BellmanFord = new BellmanFord();
  bf.layoutDiagram(diagram);
  const sc: Scale = new Scale();
  sc.layoutDiagram(diagram);
  console.log(diagram.output());
});
