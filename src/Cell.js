"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var loglevel_1 = require("loglevel");
var Point_1 = require("./Point");
var Log = loglevel_1.default.getLogger("lgop.Point");
var Cell = /** @class */ (function () {
    function Cell(row, col) {
        if (Cell.cells[row][col]) {
            throw new Error("cell " + row + "." + col + " already exists");
        }
        this.row = row;
        this.col = col;
        this.locations = [];
        this.min_z = 0;
        this.max_z = 0;
    }
    Cell.prototype.addLocation = function (location, z) {
        z = this.findBestZ(z);
        this.locations[z] = location;
        this.min_z = Math.min(this.min_z, z);
        this.max_z = Math.max(this.max_z, z);
        return z;
    };
    Cell.clear = function () {
        Cell.cells = [];
        Cell.min_col = 0;
        Cell.max_col = 0;
        Cell.min_row = 0;
        Cell.max_row = 0;
    };
    Cell.prototype.findBestZ = function (z) {
        while (this.locations[z]) {
            z += 1;
        }
        return z;
    };
    Cell.getCell = function (row, col) {
        if (!Cell.cells[row]) {
            Cell.cells[row] = [];
        }
        if (!Cell.cells[row][col]) {
            Cell.cells[row][col] = new Cell(row, col);
        }
        Cell.min_row = Math.min(Cell.min_row, row);
        Cell.max_row = Math.max(Cell.max_row, row);
        Cell.min_col = Math.min(Cell.min_col, col);
        Cell.max_col = Math.max(Cell.max_col, col);
        return Cell.cells[row][col];
    };
    Cell.getMaxZInCol = function (col) {
        var max_z = 0;
        for (var row = Cell.min_row; row <= Cell.max_row; row += 1) {
            if (Cell.cells[row][col]) {
                max_z = Math.max(max_z, Cell.cells[row][col].max_z);
            }
        }
        return max_z;
    };
    Cell.getMaxZInRow = function (row) {
        var max_z = 0;
        for (var col = Cell.min_col; col <= Cell.max_col; col += 1) {
            if (Cell.cells[row][col]) {
                max_z = Math.max(max_z, Cell.cells[row][col].max_z);
            }
        }
        return max_z;
    };
    Cell.getMinZInCol = function (col) {
        var min_z = 0;
        for (var row = Cell.min_row; row <= Cell.max_row; row += 1) {
            if (Cell.cells[row][col]) {
                min_z = Math.min(min_z, Cell.cells[row][col].min_z);
            }
        }
        return min_z;
    };
    Cell.getMinZInRow = function (row) {
        var min_z = 0;
        for (var col = Cell.min_col; col <= Cell.max_col; col += 1) {
            if (Cell.cells[row][col]) {
                min_z = Math.min(min_z, Cell.cells[row][col].min_z);
            }
        }
        return min_z;
    };
    Cell.prototype.getPosition = function (z) {
        var x = 120 + (100 * ((z || 0) - Cell.getMinZInCol(this.col)));
        var y = 20 + (40 * (Cell.getMaxZInRow(this.row) - (z || 0)));
        for (var i = Cell.min_col; i < this.col; i += 1) {
            x += (Cell.getMaxZInCol(i) - Cell.getMinZInCol(i)) * 100 + 150;
        }
        for (var i = Cell.min_row; i < this.row; i += 1) {
            y += (Cell.getMaxZInRow(i) - Cell.getMinZInRow(i)) * 40 + 60;
        }
        return new Point_1.default(x, y);
    };
    Cell.report = function () {
        for (var row = Cell.min_row; row <= Cell.max_row; row += 1) {
            for (var col = Cell.min_col; col <= Cell.max_col; col += 1) {
                var cell = Cell.cells[row][col];
                if (cell) {
                    Log.debug("cell " + row + ", " + col + ": " + cell.min_z + " - " + cell.max_z);
                }
            }
        }
        for (var i = Cell.min_row; i <= Cell.max_row; i += 1) {
            Log.debug("row " + i + " min: " + Cell.getMinZInRow(i) + " max: " + Cell.getMaxZInRow(i));
        }
        for (var i = Cell.min_col; i <= Cell.max_col; i += 1) {
            Log.debug("col " + i + " min: " + Cell.getMinZInCol(i) + " max: " + Cell.getMaxZInCol(i));
        }
    };
    Cell.cells = [];
    Cell.min_row = 0;
    Cell.max_row = 0;
    Cell.min_col = 0;
    Cell.max_col = 0;
    return Cell;
}());
exports.default = Cell;
