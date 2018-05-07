
import * as React from "react";
import * as ReactDOM from "react-dom";
import AjaxStore from "lapis/store/AjaxStore";
import RootLog from "loglevel";
import _ from "underscore";
import Url from "url";
import Doc from "./Doc";


/* globals window */

RootLog.setLevel("debug");
const Log = RootLog.getLogger("lgop.App");

const Store = new AjaxStore(null, "./");
Store.setModeServer();


interface Props {}

interface State {
  doc_id: string;
}

class App extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const that = this;

    window.onhashchange = function () {
      Log.debug("window.onhashchange event");
      that.hashChange();
    };
    this.state = this.makeRepoDocState();
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
      doc_id: hash,
    } as State;
    return state;
  }


  render() {
    return (
      <div>
        <Doc store={Store} doc_id={this.state.doc_id} />
      </div>
    );
  }


}

ReactDOM.render(<App />,
  window.document.getElementById("app_dynamic"));
