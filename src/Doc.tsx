
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
  iteration: number;
}

export default class Doc extends React.Component<Props, State> {
  private fd: ForceDirected;
  private fixer: OverlapFixer;
  private svg: SVG;
  private sc: SimpleConnectors;
  private proceed: boolean;

  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      iteration: 0,
    } as State;
    this.proceed = false;
    this.fixer = new OverlapFixer();
    this.svg = new SVG();
    this.sc = new SimpleConnectors(1);
    this.load(props);
  }


  private load(props: Props) {
    console.log(`Map.load() getting: props.doc_id: ${props.doc_id}`);
    const iterate = () => {
      if (!this.proceed) {
        return;
      }
      const again: boolean = this.fd.iterate();
      console.log(`iterate() ${this.state.iteration} again? ${again} total_disp: ${this.fd.getTotalDisplacement()}`);
      if (again) {
        setTimeout(iterate);
      }
      this.setState({
        iteration: this.state.iteration + 1,
      });
    };
    props.store.getDoc(props.doc_id)
      .then((doc: { id: string, content: string }) => {
        const diagram: Diagram = new Diagram();
        const loader = new MapLoader(diagram);
        loader.parseContent(doc.content);

        // const bf: BellmanFord = new BellmanFord();
        // bf.layoutDiagram(diagram);
        // this.fixer.layoutDiagram(diagram);

        // const fd: ForceDirected = new ForceDirected();
        this.fd = new ForceDirected();
        this.fd.beginDiagram(diagram);
        this.proceed = true;
        iterate();
        // fd.layoutDiagram(diagram);

        // const sc: Scale = new Scale();
        // sc.layoutDiagram(diagram);

        // simple_conns.layoutDiagram(diagram);

        this.setState({
          ready: true,
          diagram: diagram,
        });
      }) as Promise<void>;
  }


  componentWillReceiveProps(next_props) {
    this.proceed = false;
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
    this.sc.layoutDiagram(this.state.diagram);
    return (
      <div>
        <h1>{this.state.diagram.getTitle()}</h1>
        {this.svg.drawDiagram(this.state.diagram)}
      </div>
    );
  }

}
