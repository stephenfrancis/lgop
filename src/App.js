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
var ReactDOM = require("react-dom");
var AjaxStore_1 = require("lapis/store/AjaxStore");
var loglevel_1 = require("loglevel");
var url_1 = require("url");
var Doc_1 = require("./Doc");
/* globals window */
loglevel_1.default.setLevel("debug");
var Log = loglevel_1.default.getLogger("lgop.App");
var Store = new AjaxStore_1.default(null, "./");
Store.setModeServer();
Store.setResponseConverter(function (url, str) {
    return {
        id: url,
        content: str,
    };
});
var App = /** @class */ (function (_super) {
    __extends(App, _super);
    function App(props) {
        var _this = _super.call(this, props) || this;
        var that = _this;
        window.onhashchange = function () {
            Log.debug("window.onhashchange event");
            that.hashChange();
        };
        _this.state = _this.makeRepoDocState();
        return _this;
    }
    App.prototype.hashChange = function () {
        this.setState(this.makeRepoDocState());
    };
    App.prototype.makeRepoDocState = function () {
        var url = url_1.default.parse(window.location.href);
        var hash = url.hash || "";
        if (hash) {
            hash = hash.substr(1);
        }
        else {
            hash = "README.md";
        }
        var state = {
            doc_id: hash,
        };
        return state;
    };
    App.prototype.render = function () {
        return (React.createElement("div", null,
            React.createElement(Doc_1.default, { store: Store, doc_id: this.state.doc_id })));
    };
    return App;
}(React.Component));
ReactDOM.render(React.createElement(App, null), window.document.getElementById("app_dynamic"));
