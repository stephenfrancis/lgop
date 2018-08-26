
import * as React from "react";
import * as ReactDOM from "react-dom";
import AjaxStore from "../../lapis/store/AjaxStore";
// import _ from "../../lapis/node_modules/@types/underscore/index";
import Url from "url";
import Doc from "./Doc";
import InputGenerator from "./InputGenerator";


/* globals window */

// RootLog.setLevel("debug");
// const Log = RootLog.getLogger("lgop.App");

const REPULSION_CONSTANT: number = 1000;
const ATTRACTION_CONSTANT: number = 0.0001;
const DEFAULT_SPRING_LENGTH: number = 100;
const MAX_ITERATIONS: number = 100;
const MIN_DISPLACEMENT_THRESHOLD: number = 0.05;


const Store = new AjaxStore(null, "./");
Store.setModeServer();
Store.setResponseConverter(function (url: string, str: string): any {
  return {
    id: url,
    content: str,
  };
});


interface Props {}

interface State {
  doc_id: string;
  block_iterations: number;
  block_layout: string;
  block_fd_attraction: number;
  block_fd_repulsion: number;
  block_fd_spring_length: number;
  block_fd_disp_thresh: number;
  connector_layout: string;
  connector_sophistication: number;
}

class App extends React.Component<Props, State> {
  private input_connector_layout: InputGenerator;
  private input_connector_sophistication: InputGenerator;

  constructor(props) {
    super(props);
    const that = this;

    window.onhashchange = function () {
      console.log("window.onhashchange event");
      that.hashChange();
    };
    this.changeAttractionConstant    = this.changeAttractionConstant   .bind(this);
    this.changeBlockLayout           = this.changeBlockLayout          .bind(this);
    this.changeDefaultSpringLength   = this.changeDefaultSpringLength  .bind(this);
    this.changeDisplacementThreshold = this.changeDisplacementThreshold.bind(this);
    this.changeRepulsionConstant     = this.changeRepulsionConstant    .bind(this);

    this.state = this.makeRepoDocState({
      block_fd_attraction: ATTRACTION_CONSTANT,
      block_fd_disp_thresh: MIN_DISPLACEMENT_THRESHOLD,
      block_fd_repulsion: REPULSION_CONSTANT,
      block_fd_spring_length: DEFAULT_SPRING_LENGTH,
      block_iterations: MAX_ITERATIONS,
      block_layout: "fd",
      // connector_layout: "sc",
      // connector_sophistication: 2,
    });
    this.input_connector_layout = new InputGenerator(this, "string", "connector_layout", "sc", "Connector Layout");
    this.input_connector_sophistication = new InputGenerator(this, "number", "connector_sophistication", 1, "Connector Sophistication");
  }


  private changeAttractionConstant(event: any): void {
    this.setState({
      block_fd_attraction: App.getNumberFromEvent(event),
    });
  }


  private changeBlockLayout(event: any): void {
    this.setState({
      block_layout: App.getStringFromEvent(event),
    });
  }


  private changeDefaultSpringLength(event: any): void {
    this.setState({
      block_fd_spring_length: App.getNumberFromEvent(event),
    })
  }


  private changeDisplacementThreshold(event: any): void {
    this.setState({
      block_fd_disp_thresh: App.getNumberFromEvent(event),
    })
  }


  private changeRepulsionConstant(event: any): void {
    this.setState({
      block_fd_repulsion: App.getNumberFromEvent(event),
    })
  }


  private static getNumberFromEvent(event: any): number {
    let num: number = parseFloat(this.getStringFromEvent(event));
    if (!Number.isFinite(num)) {
      num = 0;
    }
    return num;
  }


  private static getStringFromEvent(event: any): string {
    return event && event.target && event.target.value || "";
  }


  private hashChange() {
    this.setState(this.makeRepoDocState());
  }


  private makeRepoDocState(defaults?: any): State {
    const state = defaults || {};
    const url = Url.parse(window.location.href);
    let hash = url.hash || "";
    if (hash) {
      hash = hash.substr(1);
    } else {
      hash = "README.md";
    }
    state.doc_id = hash;
    return state;
  }


  render() {
    return (
      <div>
        <Doc
          store={Store}
          docId={this.state.doc_id}
          blockIterations={this.state.block_iterations}
          blockLayout={this.state.block_layout}
          blockFDAttraction={this.state.block_fd_attraction}
          blockFDRepulsion={this.state.block_fd_repulsion}
          blockFDSpringLength={this.state.block_fd_spring_length}
          blockFDDispThresh={this.state.block_fd_disp_thresh}
          connectorLayout={this.input_connector_layout.getValue()}
          connectorSophistication={this.input_connector_sophistication.getValue()}
        />
        {this.renderForm()}
      </div>
    );
  }


  renderForm(): JSX.Element {
    return (
      <form>
        <span>
          Block Layout:
          <input
            type="text"
            defaultValue={this.state.block_layout}
            onBlur={this.changeBlockLayout}
          />
        </span>
        <span>
          Attraction Constant:
          <input
            type="number"
            defaultValue={String(this.state.block_fd_attraction)}
            onBlur={this.changeAttractionConstant}
          />
        </span>
        <span>
          Repulsion Constant:
          <input
            type="number"
            defaultValue={String(this.state.block_fd_repulsion)}
            onBlur={this.changeRepulsionConstant}
          />
        </span>
        <span>
          Spring Length:
          <input
            type="number"
            defaultValue={String(this.state.block_fd_spring_length)}
            onBlur={this.changeDefaultSpringLength}
          />
        </span>
        <span>
          Min Displacement Threshold:
          <input
            type="number"
            defaultValue={String(this.state.block_fd_disp_thresh)}
            onBlur={this.changeDisplacementThreshold}
          />
        </span>
        {this.input_connector_layout.getControlBox()}
        {this.input_connector_sophistication.getControlBox()}
      </form>
    );
  }

}

ReactDOM.render(<App />,
  window.document.getElementById("app_dynamic"));
