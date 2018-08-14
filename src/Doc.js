"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var loglevel_1 = require("loglevel");
var Map_1 = require("./Map");
var Log = loglevel_1.default.getLogger("lgop.Doc");
var Doc = /** @class */ (function (_super) {
    __extends(Doc, _super);
    function Doc(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            ready: false,
        };
        _this.load(props);
        return _this;
    }
    Doc.prototype.load = function (props) {
        var that = this;
        Log.debug("Map.load() getting: props.doc_id: " + props.doc_id);
        props.store.getDoc(props.doc_id)
            .then(function (doc) {
            that.setState({
                ready: true,
                map: new Map_1.default(doc.id, doc.content),
            });
        });
    };
    Doc.prototype.componentWillReceiveProps = function (next_props) {
        this.load(next_props);
    };
    Doc.prototype.render = function () {
        if (this.state.ready) {
            return this.renderReady();
        }
        return this.renderUnready();
    };
    Doc.prototype.renderUnready = function () {
        return (React.createElement("div", null, "Loading..."));
    };
    Doc.prototype.renderReady = function () {
        return (React.createElement("div", null,
            React.createElement("h1", null, this.state.map.getTitle()),
            this.state.map.getSVG()));
    };
    return Doc;
}(React.Component));
exports.default = Doc;
