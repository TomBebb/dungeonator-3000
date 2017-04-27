define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Point = (function () {
        function Point(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.set(x, y);
        }
        Point.prototype.set = function (x, y) {
            this.x = x;
            this.y = y;
        };
        Point.prototype.hash = function () {
            return (this.x << 16) | (this.y & 0xFFFF);
        };
        Point.eq = function (a, b) {
            return a.x === b.x && a.y === b.y;
        };
        Point.prototype.equals = function (other) {
            return Point.eq(this, other);
        };
        Point.from = function (p, copy, scale) {
            if (copy === void 0) { copy = false; }
            if (scale === void 0) { scale = 1; }
            if (copy)
                p = new Point(p.x, p.y);
            else
                Object.setPrototypeOf(p, Point.prototype);
            p.x = Math.floor(p.x * scale);
            p.y = Math.floor(p.y * scale);
            return p;
        };
        Point.prototype.distSquared = function (other) {
            return Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2);
        };
        Point.prototype.manhattanDistance = function (other) {
            return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
        };
        return Point;
    }());
    exports.Point = Point;
});
