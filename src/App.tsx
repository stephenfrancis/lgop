
import * as React from "react";
import * as ReactDOM from "react-dom";
import AjaxStore from "../../lapis/store/AjaxStore";
// import _ from "../../lapis/node_modules/@types/underscore/index";
// import Url from "url";
import Doc from "./Doc";
import InputGen from "./InputGen";


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
  // block_iterations: number;
  // block_layout: string;
  // block_fd_attraction: number;
  // block_fd_repulsion: number;
  // block_fd_spring_length: number;
  // block_fd_disp_thresh: number;
  // connector_layout: string;
  // connector_sophistication: number;
}

class App extends React.Component<Props, State> {
  private attraction_const: InputGen;
  private block_layout    : InputGen;
  private connector_layout: InputGen;
  private connector_sophis: InputGen;
  private def_spring_len  : InputGen;
  private disp_threshold  : InputGen;
  private max_iterations  : InputGen;
  private repulsion_const : InputGen;

  constructor(props) {
    super(props);
    const that = this;

    window.onhashchange = function () {
      console.log("window.onhashchange event");
      that.hashChange();
    };

    this.state = this.makeRepoDocState();
    this.attraction_const = new InputGen(this, "number", "attraction_const", ATTRACTION_CONSTANT, "Attraction Constant");
    this.block_layout     = new InputGen(this, "string", "block_layout", "fd", "Block Layout");
    this.connector_layout = new InputGen(this, "string", "connector_layout", "sc", "Connector Layout");
    this.connector_sophis = new InputGen(this, "number", "connector_sophis", 1, "Connector Sophistication");
    this.disp_threshold   = new InputGen(this, "number", "disp_threshold", MIN_DISPLACEMENT_THRESHOLD, "Min Displacement Threshold");
    this.def_spring_len   = new InputGen(this, "number", "def_spring_len", DEFAULT_SPRING_LENGTH, "Spring Length");
    this.max_iterations   = new InputGen(this, "number", "max_iterations", MAX_ITERATIONS, "Maximum Iterations");
    this.repulsion_const  = new InputGen(this, "number", "repulsion_const", REPULSION_CONSTANT, "Repulsion Constant");
  }


  private hashChange() {
    this.setState(this.makeRepoDocState());
  }


  private makeRepoDocState(defaults?: any): State {
    const state = defaults || {};
    const index = window.location.href.indexOf("#");
    let hash;
    if (index > 0) {
      hash = window.location.href.substr(index + 1);
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
          blockIterations={this.max_iterations.getValue()}
          blockLayout={this.block_layout.getValue()}
          blockFDAttraction={this.attraction_const.getValue()}
          blockFDRepulsion={this.repulsion_const.getValue()}
          blockFDSpringLength={this.def_spring_len.getValue()}
          blockFDDispThresh={this.disp_threshold.getValue()}
          connectorLayout={this.connector_layout.getValue()}
          connectorSophistication={this.connector_sophis.getValue()}
        />
        {this.renderForm()}
      </div>
    );
  }


  renderForm(): JSX.Element {
    return (
      <form>
        {this.attraction_const.getControlBox()}
        {this.block_layout    .getControlBox()}
        {this.connector_layout.getControlBox()}
        {this.connector_sophis.getControlBox()}
        {this.def_spring_len  .getControlBox()}
        {this.disp_threshold  .getControlBox()}
        {this.max_iterations  .getControlBox()}
        {this.repulsion_const .getControlBox()}
      </form>
    );
  }

}

ReactDOM.render(<App />,
  window.document.getElementById("app_dynamic"));
