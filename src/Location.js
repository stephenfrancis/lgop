"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var loglevel_1 = require("loglevel");
var Uuidv4 = require("uuid/v4");
var Block_1 = require("./Block");
var Cell_1 = require("./Cell");
var Direction_1 = require("./Direction");
var Log = loglevel_1.default.getLogger("lgop.Location");
var Location = /** @class */ (function () {
    function Location(name) {
        this.positioned = false;
        this.block = new Block_1.default(name);
        this.directions = {};
        this.elmt_id = Uuidv4();
    }
    Location.prototype.addDirection = function (direction, other_location) {
        var dir = Direction_1.default.get(direction);
        if (!dir) {
            throw new Error("invalid direction code: " + direction);
        }
        if (this.directions[direction]) {
            throw new Error("direction already specified: " + direction);
        }
        this.directions[direction] = Location.getLocation(other_location);
        this.block.addConnector(this.directions[direction].block, dir);
        this.positionRelativeIfNecessary(direction);
    };
    Location.prototype.addLink = function (link_url, link_text) {
        this.block.setLink(link_url, link_text);
    };
    Location.prototype.draw = function (done_locations) {
        var _this = this;
        done_locations = done_locations || [];
        if (done_locations.indexOf(this) > -1) {
            return null;
        }
        this.setBlockCoordinates();
        var content = [];
        content.push(this.block.svg());
        content.push(this.block.svgText());
        done_locations.push(this);
        Object.keys(this.directions).forEach(function (dir) {
            content.push(_this.directions[dir].draw(done_locations));
        });
        content.push(this.block.svgConnectors());
        return (React.createElement("g", { key: this.elmt_id }, content));
    };
    Location.prototype.checkPositioned = function () {
        if (!this.positioned) {
            throw new Error("location not positioned: " + this.getId());
        }
    };
    Location.clear = function () {
        Location.locations = {};
    };
    Location.prototype.getDirection = function (direction) {
        if (!this.directions[direction]) {
            throw new Error("no location in this direction: " + direction);
        }
        return this.directions[direction];
    };
    Location.prototype.getDirections = function () {
        return this.directions;
    };
    Location.prototype.getId = function () {
        return this.block.getName().replace(/\s+/g, "_").toLowerCase();
    };
    Location.getLocation = function (name) {
        name = name.trim();
        if (!Location.locations[name]) {
            Location.locations[name] = new Location(name);
        }
        return Location.locations[name];
    };
    Location.prototype.positionRelativeIfNecessary = function (direction) {
        this.checkPositioned();
        var other_location = this.directions[direction];
        if (!other_location.positioned) {
            var d = Direction_1.default.get(direction);
            if (d) {
                other_location.setPosition(this.col + d.getDeltaCol(), this.row + d.getDeltaRow(), this.z + d.getDeltaZ());
            }
        }
    };
    Location.prototype.setBlockCoordinates = function () {
        var point = Cell_1.default.getCell(this.row, this.col).getPosition(this.z);
        Log.debug("setBlockCoords() " + point.getX() + ", " + point.getY());
        this.block.getCentre().setX(point.getX());
        this.block.getCentre().setY(point.getY());
    };
    Location.prototype.setPosition = function (col, row, z) {
        this.col = col;
        this.row = row;
        this.positioned = true;
        this.z = Cell_1.default.getCell(row, col).addLocation(this, z);
    };
    Location.locations = {};
    return Location;
}());
exports.default = Location;
