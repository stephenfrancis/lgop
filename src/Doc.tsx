
import * as React from "react";
import AjaxStore from "../../lapis/store/AjaxStore";
import Diagram from "./core/Diagram";
import ForceDirected from "./layout/ForceDirected";
import MapLoader from "./loaders/MapLoader";
import BellmanFord from "./layout/BellmanFord";
import OverlapFixer from "./layout/OverlapFixer";
import Scale from "./layout/Scale";
import SimpleConnectors from "./layout/SimpleConnectors";
import SVG from "./drawing/SVG";


// const Log = RootLog.getLogger("lgop.Doc");


interface Props {
  store: AjaxStore;
  doc_id: string;
}

interface State {
  ready: boolean;
  diagram: Diagram;
}

export default class Doc extends React.Component<Props, State> {
  // private fd: ForceDirected;
  private fixer: OverlapFixer;
  private svg: SVG;

  constructor(props) {
    super(props);
    this.state = {
      ready: false,
    } as State;
    // this.fd = new ForceDirected();
    this.fixer = new OverlapFixer();
    this.svg = new SVG();
    this.load(props);
  }


  private load(props: Props) {
    console.log(`Map.load() getting: props.doc_id: ${props.doc_id}`);
    props.store.getDoc(props.doc_id)
      .then((doc: { id: string, content: string }) => {
        const diagram: Diagram = new Diagram();
        const loader = new MapLoader(diagram);
        loader.parseContent(doc.content);
        const bf: BellmanFord = new BellmanFord();
        bf.layoutDiagram(diagram);
        this.fixer.layoutDiagram(diagram);

        // const fd: ForceDirected = new ForceDirected();
        // fd.layoutDiagram(diagram);

        const sc: Scale = new Scale();
        sc.layoutDiagram(diagram);

        const simple_conns: SimpleConnectors = new SimpleConnectors(3);
        simple_conns.layoutDiagram(diagram);

        this.setState({
          ready: true,
          diagram: diagram,
        });
      }) as Promise<void>;
  }


  componentWillReceiveProps(next_props) {
    this.load(next_props);
  }


  render() {
    if (this.state.ready) {
      return this.renderReady();
    }
    return this.renderUnready();
  }


  renderUnready() {
    return (
      <div>Loading...</div>
    );
  }


  renderReady() {
    return (
      <div>
        <h1>{this.state.diagram.getTitle()}</h1>
        {this.svg.drawDiagram(this.state.diagram)}
      </div>
    );
  }

}
