
import Diagram from "../core/Diagram";


export default interface Layout {

  beginDiagram(diagram: Diagram): void;

  iterate(): boolean;

}