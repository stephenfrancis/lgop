
import * as React from "react";
import RootLog from "loglevel";
import AjaxStore from "lapis/store/AjaxStore";
import Map from "./Map";


const Log = RootLog.getLogger("lgop.Doc");


interface Props {
  store: AjaxStore;
  doc_id: string;
}

interface State {
  ready: boolean;
  map: Map;
}

export default class Doc extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      ready: false,
    } as State;
    this.load(props);
  }


  private load(props: Props) {
    const that = this;
    Log.debug(`Map.load() getting: props.doc_id`);
    props.store.getDoc(props.doc_id)
      .then(function (doc: { id: string, content: string }): void {
        that.setState({
          ready: true,
          map: new Map(doc.id, doc.content),
        });
      }) as Promise<void>;
  }



  componentWillReceiveProps(next_props) {
    this.load(next_props);
  }


  render() {
    return (
      <div>
        {this.state.map.getSVG()}
      </div>
    );
  }

}
