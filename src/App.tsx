
import * as React from "react";
import * as ReactDOM from "react-dom";
import AjaxStore from "../../lapis/store/AjaxStore";
// import _ from "../../lapis/node_modules/@types/underscore/index";
import Url from "url";
import Doc from "./Doc";


/* globals window */

// RootLog.setLevel("debug");
// const Log = RootLog.getLogger("lgop.App");

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
  fix_overlaps: boolean;
}

class App extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const that = this;

    window.onhashchange = function () {
      console.log("window.onhashchange event");
      that.hashChange();
    };
    this.state = this.makeRepoDocState();
  }


  private hashChange() {
    this.setState(this.makeRepoDocState());
  }


  private makeRepoDocState(): State {
    const url = Url.parse(window.location.href);
    let fix_overlaps: boolean = (url.query === "fix");
    let hash = url.hash || "";
    if (hash) {
      hash = hash.substr(1);
    } else {
      hash = "README.md";
    }
    const state = {
      doc_id: hash,
      fix_overlaps: fix_overlaps,
    } as State;
    return state;
  }


  render() {
    return (
      <div>
        <Doc
          store={Store}
          doc_id={this.state.doc_id}
          fix_overlaps={this.state.fix_overlaps}
        />
        <div>Fixing Overlaps? {String(this.state.fix_overlaps)}</div>
      </div>
    );
  }


}

ReactDOM.render(<App />,
  window.document.getElementById("app_dynamic"));
