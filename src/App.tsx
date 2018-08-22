
import * as React from "react";
import * as ReactDOM from "react-dom";
import AjaxStore from "../../lapis/store/AjaxStore";
// import _ from "../../lapis/node_modules/@types/underscore/index";
import Url from "url";
import Doc from "./Doc";


/* globals window */

// RootLog.setLevel("debug");
// const Log = RootLog.getLogger("lgop.App");

const REPULSION_CONSTANT: number = 1000;
const ATTRACTION_CONSTANT: number = 0.0001;
const DEFAULT_SPRING_LENGTH: number = 100;
const MAX_ITERATIONS: number = 1000;
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
  constructor(props) {
    super(props);
    const that = this;

    window.onhashchange = function () {
      console.log("window.onhashchange event");
      that.hashChange();
    };
    this.changeAttractionConstant = this.changeAttractionConstant.bind(this);
    this.changeDefaultSpringLength = this.changeDefaultSpringLength.bind(this);
    this.changeDisplacementThreshold = this.changeDisplacementThreshold.bind(this);
    this.changeRepulsionConstant = this.changeRepulsionConstant.bind(this);

    this.state = this.makeRepoDocState();
  }


  private changeAttractionConstant(event: any): void {
    this.setState({
      block_fd_attraction: (event.target.value || "").parseFloat() || 0,
    })
  }


  private changeDefaultSpringLength(event: any): void {
    this.setState({
      block_fd_spring_length: (event.target.value || "").parseFloat() || 0,
    })
  }


  private changeDisplacementThreshold(event: any): void {
    this.setState({
      block_fd_disp_thresh: (event.target.value || "").parseFloat() || 0,
    })
  }


  private changeRepulsionConstant(event: any): void {
    this.setState({
      block_fd_repulsion: (event.target.value || "").parseFloat() || 0,
    })
  }


  private hashChange() {
    this.setState(this.makeRepoDocState());
  }


  private makeRepoDocState(): State {
    const url = Url.parse(window.location.href);
    let hash = url.hash || "";
    if (hash) {
      hash = hash.substr(1);
    } else {
      hash = "README.md";
    }
    const state = {
      block_fd_attraction: ATTRACTION_CONSTANT,
      block_fd_disp_thresh: MIN_DISPLACEMENT_THRESHOLD,
      block_fd_repulsion: REPULSION_CONSTANT,
      block_fd_spring_length: DEFAULT_SPRING_LENGTH,
      block_iterations: MAX_ITERATIONS,
      block_layout: "fd",
      connector_layout: "sc",
      connector_sophistication: 1,
      doc_id: hash,
    } as State;
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
          connectorLayout={this.state.connector_layout}
          connectorSophistication={this.state.connector_sophistication}
        />
        {this.renderForm()}
      </div>
    );
  }


  renderForm(): JSX.Element {
    return (
      <form>
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
      </form>
    );
  }

}

ReactDOM.render(<App />,
  window.document.getElementById("app_dynamic"));
