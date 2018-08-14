"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var loglevel_1 = require("loglevel");
var Block_1 = require("./Block");
var Direction_1 = require("./Direction");
var Point_1 = require("./Point");
var Log = loglevel_1.default.getLogger("lgop.Map");
var basePoint = new Point_1.default(20, 5);
var Map = /** @class */ (function () {
    function Map(id, content) {
        this.id = id;
        this.blocks = {};
        this.parseContent(content);
        this.calcLayout();
    }
    Map.prototype.calcLayout = function () {
        this.setAllBlocksInitialPositions();
        for (var i = 0; i < 5; i += 1) {
            var new_positions = this.initializeNewPositions();
            this.calcNewPositions(new_positions);
            this.setAllBlocksNewPositions(new_positions);
        }
        this.shiftAllBlocksIntoView();
        this.reportBlockPositions();
    };
    Map.prototype.calcNewPositions = function (new_positions) {
        var _this = this;
        Object.keys(this.blocks).forEach(function (block_id) {
            var block = _this.blocks[block_id];
            var fraction = block.getConnectors().length;
            block.getConnectors().forEach(function (connector) {
                var new_position = new_positions[connector.getTo().getName()];
                connector.amendNewPosition(new_position, fraction);
            });
        });
    };
    Map.prototype.getOrAddBlock = function (name) {
        name = name.trim();
        if (!this.blocks[name]) {
            this.blocks[name] = new Block_1.default(name);
        }
        return this.blocks[name];
    };
    Map.prototype.getSVG = function () {
        var _this = this;
        var children = [];
        Object.keys(this.blocks).forEach(function (block_id) { return children.push(_this.blocks[block_id].svg()); });
        return (React.createElement("svg", { height: "800", version: "1.1", width: "1200", xmlns: "http://www.w3.org/2000/svg" }, children));
    };
    Map.prototype.getTitle = function () {
        return this.title;
    };
    Map.prototype.initializeNewPositions = function () {
        var _this = this;
        var new_positions = {};
        Object.keys(this.blocks).forEach(function (block_id) {
            var point = new Point_1.default(0, 0);
            point.setTo(_this.blocks[block_id].getCentre());
            new_positions[block_id] = point;
        });
        return new_positions;
    };
    Map.prototype.isBlock = function (line, parse_state) {
        var match = line.match(/^\* (.*)$/);
        if (match && match.length > 1) {
            parse_state.block = this.getOrAddBlock(match[1]);
            return true;
        }
        return false;
    };
    Map.prototype.isConnector = function (line, parse_state) {
        var match = line.match(/^ {2}\* (N|NE|E|SE|S|SW|W|NW|U|D): (.*)$/);
        if (match && match.length > 2 && parse_state.block) {
            var from_dir = Direction_1.default.get(match[1]);
            var to = this.getOrAddBlock(match[2]);
            parse_state.block.addConnector(to, from_dir);
            return true;
        }
        match = line.match(/^ {2}\* C:\s*\[(.*?)\]\((.*)\)$/);
        if (match && match.length > 2 && parse_state.block) {
            parse_state.block.setLink(match[2], match[1]);
        }
        return false;
    };
    Map.prototype.isTitle = function (line, parse_state) {
        var match = line.match(/^# (.*)/);
        if (match) {
            this.title = match[1];
        }
        return !!match;
    };
    Map.prototype.parseContent = function (content) {
        var that = this;
        var lines = content.split(/\r\n|\n/);
        var parse_state = {
            inside_room: false,
        };
        lines.forEach(function (line) {
            var done = false;
            done = done || that.isBlock(line, parse_state);
            done = done || that.isConnector(line, parse_state);
            done = done || that.isTitle(line, parse_state);
            if (!done) {
                that.reportError("unused line: " + line);
            }
        });
    };
    Map.prototype.reportError = function (str) {
        console.log(this.id + ": " + str); // eslint-disable-line no-console
    };
    Map.prototype.reportBlockPositions = function () {
        var _this = this;
        Object.keys(this.blocks).forEach(function (block_id) {
            console.log(_this.blocks[block_id].toString());
        });
    };
    Map.prototype.setAllBlocksInitialPositions = function () {
        var _this = this;
        Object.keys(this.blocks).forEach(function (block_id) {
            _this.blocks[block_id].getCentre().setTo(basePoint);
        });
    };
    Map.prototype.setAllBlocksNewPositions = function (new_positions) {
        var _this = this;
        Object.keys(new_positions).forEach(function (block_id) {
            _this.blocks[block_id].getCentre().setTo(new_positions[block_id]);
        });
    };
    Map.prototype.shiftAllBlocksIntoView = function () {
        var _this = this;
        var x_thresh = 200;
        var y_thresh = 50;
        var min_x = x_thresh;
        var min_y = y_thresh;
        Object.keys(this.blocks).forEach(function (block_id) {
            var point = _this.blocks[block_id].getCentre();
            min_x = Math.min(min_x, point.getX());
            min_y = Math.min(min_y, point.getY());
        });
        if (min_x < x_thresh || min_y < y_thresh) {
            Object.keys(this.blocks).forEach(function (block_id) {
                var point = _this.blocks[block_id].getCentre();
                point.setX(point.getX() + (x_thresh - min_x));
                point.setY(point.getY() + (y_thresh - min_y));
            });
        }
    };
    return Map;
}());
exports.default = Map;
