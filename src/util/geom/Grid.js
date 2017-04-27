define(["require", "exports", "./Point", "../ds/HashMap", "../ds/HashSet", "../ds/Heap"], function (require, exports, Point_1, HashMap_1, HashSet_1, Heap_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Grid = (function () {
        function Grid(width, height) {
            this.rooms = [];
            this.width = width;
            this.height = height;
            this.tiles = new Int8Array(width * height);
            this.clear();
        }
        Grid.prototype.fill = function (r, t) {
            for (var x = r.x; x < r.x + r.width; x++)
                for (var y = r.y; y < r.y + r.height; y++)
                    this.tiles[this.index(x, y)] = t;
        };
        Grid.prototype.outline = function (r, t) {
            for (var x = r.x; x <= r.x + r.width; x++) {
                this.tiles[this.index(x, r.y)] = t;
                this.tiles[this.index(x, r.y + r.height)] = t;
            }
            for (var y = r.y; y <= r.y + r.height; y++) {
                this.tiles[this.index(r.x, y)] = t;
                this.tiles[this.index(r.x + r.width, y)] = t;
            }
        };
        Grid.prototype.hline = function (x1, x2, y, t) {
            for (var x = Math.min(x1, x2); x <= Math.max(x1, x2); x++)
                this.setTileAt(x, y, t);
        };
        Grid.prototype.vline = function (x, y1, y2, t) {
            for (var y = Math.min(y1, y2); y <= Math.max(y1, y2); y++)
                this.setTileAt(x, y, t);
        };
        Grid.prototype.clear = function (t) {
            if (t === void 0) { t = 0; }
            this.tiles.fill(t);
        };
        Grid.prototype.index = function (x, y) {
            return x + y * this.width;
        };
        Grid.prototype.tileAt = function (x, y) {
            return this.tiles[this.index(x, y)];
        };
        Grid.prototype.setTileAt = function (x, y, t) {
            this.tiles[this.index(x, y)] = t;
        };
        Grid.prototype.isValid = function (x, y) {
            return x >= 0 && y >= 0 && x < this.width && y < this.height;
        };
        Grid.prototype.isEmpty = function (x, y) {
            return this.isValid(x, y) && this.tileAt(x, y) === 0;
        };
        Grid.prototype.canWalk = function (x, y) {
            return this.isValid(x, y) && this.tileAt(x, y) != 1;
        };
        Grid.prototype.isNotEmpty = function (x, y) {
            return this.isValid(x, y) && this.tileAt(x, y) !== 0;
        };
        Grid.prototype.findPath = function (_start, goal) {
            var start = Point_1.Point.from(_start);
            var fScores = new HashMap_1.default();
            var gScores = new HashMap_1.default();
            var parents = new HashMap_1.default();
            var closed = new HashSet_1.default();
            var open = new Heap_1.default(function (p) { return fScores.get(p); });
            var openSet = new HashSet_1.default();
            gScores.set(start, 0);
            fScores.set(start, start.manhattanDistance(goal));
            open.push(start);
            openSet.add(start);
            while (open.size > 0) {
                var current = open.pop();
                openSet.delete(current);
                closed.add(current);
                if (current.equals(goal)) {
                    var path = [current];
                    while (parents.has(current)) {
                        current = parents.get(current);
                        path.push(current);
                    }
                    return path.reverse();
                }
                var g = gScores.get(current) + 1;
                var neighbours = this.neighbours(current);
                for (var _i = 0, neighbours_1 = neighbours; _i < neighbours_1.length; _i++) {
                    var n = neighbours_1[_i];
                    if (!closed.has(n) && this.canWalk(n.x, n.y) && (!openSet.has(n) || g < gScores.get(n))) {
                        if (!openSet.has(n)) {
                            openSet.add(n);
                            open.push(n);
                        }
                        parents.set(n, current);
                        gScores.set(n, g);
                        fScores.set(n, g + n.manhattanDistance(goal));
                    }
                }
            }
            return [];
        };
        Grid.prototype.neighbours = function (p) {
            return [
                new Point_1.Point(p.x - 1, p.y),
                new Point_1.Point(p.x + 1, p.y),
                new Point_1.Point(p.x, p.y - 1),
                new Point_1.Point(p.x, p.y + 1)
            ];
        };
        return Grid;
    }());
    exports.default = Grid;
});
