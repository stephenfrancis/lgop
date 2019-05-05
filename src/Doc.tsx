
import * as React from "react";
import AjaxStore from "../../lapis/store/AjaxStore";
import Diagram from "./core/Diagram";
import FinishConnectors from "./layout/FinishConnectors";
import ForceDirected from "./layout/ForceDirected";
import Lee from "./layout/Lee";
import MapLoader from "./loaders/MapLoader";
import BellmanFord from "./layout/BellmanFord";
import OverlapFixer from "./layout/OverlapFixer";
import Scale from "./layout/Scale";
import SimpleConnectors from "./layout/SimpleConnectors";
import SVG from "./drawing/SVG";


// const Log = RootLog.getLogger("lgop.Doc");


interface Props {
  blockLayout: string; // fd = ForceDirected, bf = BellmanFord + OverlapFixer + Scale
  blockIterations: number;
  blockFDAttraction: number;
  blockFDRepulsion: number;
  blockFDSpringLength: number;
  blockFDDispThresh: number;
  connectorLayout: string; // sc = SimpleConnectors
  connectorSophistication: number;
  store: AjaxStore;
  docId: string;
}

interface State {
  ready: boolean;
  diagram: Diagram;
  iteration: number;
}

export default class Doc extends React.Component<Props, State> {
  private fd: ForceDirected;
  private proceed: boolean;

  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      iteration: 0,
    } as State;
    this.proceed = false;
    this.load(props);
  }


  private load(props: Props) {
    console.log(`Map.load() getting: props.doc_id: ${props.docId}`);
    const iterate = () => {
      if (!this.proceed) {
        return;
      }
      const again: boolean = this.fd.iterate();
      // console.log(`iterate() ${this.state.iteration} again? ${again} total_disp: ${this.fd.getTotalDisplacement()}`);
      if (again) {
        setTimeout(iterate);
      }
      this.setState({
        iteration: this.state.iteration + 1,
      });
    };
    props.store.getDoc(props.docId)
      .then((doc: { id: string, content: string }) => {
        const diagram: Diagram = new Diagram();
        const loader = new MapLoader(diagram);
        loader.parseContent(doc.content);

        console.log(`Doc.load():getDoc() blockLayout? ${this.props.blockLayout}`);
        if (this.props.blockLayout === "bf") {
          const bf: BellmanFord = new BellmanFord();
          bf.beginDiagram(diagram);
          while (bf.iterate());
          const of: OverlapFixer = new OverlapFixer();
          of.beginDiagram(diagram);
          while (of.iterate());
        } else {
          this.fd = new ForceDirected(this.props.blockFDAttraction,
            this.props.blockFDRepulsion, this.props.blockFDSpringLength,
            this.props.blockIterations, this.props.blockFDDispThresh);
          this.fd.beginDiagram(diagram);
          this.proceed = true;
          iterate();
        }

        // const fd: ForceDirected = new ForceDirected();
        // fd.layoutDiagram(diagram);


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
    if (this.props.connectorLayout === "sc") {
      const sc: SimpleConnectors = new SimpleConnectors(this.props.connectorSophistication);
      sc.layoutDiagram(this.state.diagram);

    } else { // Lee
      const sc: Scale = new Scale("double_cell");
      sc.beginDiagram(this.state.diagram);
      while (sc.iterate());

      const l: Lee = new Lee();
      // console.log(l.output());
      l.beginDiagram(this.state.diagram);
      while (l.iterate());
    }

    if (this.props.blockLayout === "bf") {
      const sc: Scale = new Scale("svg");
      sc.beginDiagram(this.state.diagram);
      while (sc.iterate());

      if (this.props.connectorLayout !== "sc") {
        const fc: FinishConnectors = new FinishConnectors();
        fc.layoutDiagram(this.state.diagram);
      }
    }

    const svg: SVG = new SVG();

    return (
      <div>
        <h1>{this.state.diagram.getTitle()}</h1>
        {svg.drawDiagram(this.state.diagram)}
      </div>
    );
  }

}
