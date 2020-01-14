
import * as React from "react";
import AjaxStore from "../../lapis/store/AjaxStore";
import * as Diagram from "diagram-api";

// import Diagram from "./core/Diagram";
// import FinishConnectors from "./layout/FinishConnectors";
// import ForceDirected from "./layout/ForceDirected";
// import Lee from "./layout/Lee";
// import MapLoader from "./loaders/MapLoader";
// import BellmanFord from "./layout/BellmanFord";
// import OverlapFixer from "./layout/OverlapFixer";
// import Scale from "./layout/Scale";
// import SimpleConnectors from "./layout/SimpleConnectors";
// import SVG from "./drawing/SVG";


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
  domain: Diagram.Domain;
  iteration: number;
}

export default class Doc extends React.Component<Props, State> {
  private fd: Diagram.ForceDirected;
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
        const domain: Diagram.Domain = new Diagram.Domain();
        const loader = new Diagram.MapLoader(domain);
        loader.parseContent(doc.content);

        console.log(`Doc.load():getDoc() blockLayout? ${this.props.blockLayout}`);
        if (this.props.blockLayout === "bf") {
          const bf: Diagram.BellmanFord = new Diagram.BellmanFord();
          bf.beginDomain(domain);
          while (bf.iterate());
          const of: Diagram.OverlapFixer = new Diagram.OverlapFixer();
          of.beginDomain(domain);
          while (of.iterate());
        } else {
          this.fd = new Diagram.ForceDirected(this.props.blockFDAttraction,
            this.props.blockFDRepulsion, this.props.blockFDSpringLength,
            this.props.blockIterations, this.props.blockFDDispThresh);
          this.fd.beginDomain(domain);
          this.proceed = true;
          iterate();
        }

        // const fd: ForceDirected = new ForceDirected();
        // fd.layoutDiagram(diagram);


        // simple_conns.layoutDiagram(diagram);

        this.setState({
          ready: true,
          domain: domain,
        });
      });
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
      const sc: Diagram.SimpleConnectors = new Diagram.SimpleConnectors(this.props.connectorSophistication);
      sc.layoutDomain(this.state.domain);

    } else { // Lee
      const sc: Diagram.Scale = new Diagram.Scale("double_cell");
      sc.beginDomain(this.state.domain);
      while (sc.iterate());

      const l: Diagram.Lee = new Diagram.Lee();
      // console.log(l.output());
      l.beginDomain(this.state.domain);
      while (l.iterate());
    }

    if (this.props.blockLayout === "bf") {
      const sc: Diagram.Scale = new Diagram.Scale("svg");
      sc.beginDomain(this.state.domain);
      while (sc.iterate());

      if (this.props.connectorLayout !== "sc") {
        const fc: Diagram.FinishConnectors = new Diagram.FinishConnectors();
        fc.layoutDomain(this.state.domain);
      }
    }

    return (
      <div>
        <h1>{this.state.domain.getTitle()}</h1>
        {this.state.domain.draw().getMarkup()}
      </div>
    );
  }

}
