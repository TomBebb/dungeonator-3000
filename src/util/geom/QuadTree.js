define(["require", "exports", "./Rectangle", "../math"], function (require, exports, Rectangle_1, math_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var QuadTree = (function () {
        function QuadTree(bounds, depth) {
            if (depth === void 0) { depth = 0; }
            this.objects = [];
            this.bounds = bounds;
            this.depth = depth;
        }
        QuadTree.prototype.clear = function () {
            this.topLeft = undefined;
            this.topRight = undefined;
            this.bottomLeft = undefined;
            this.bottomRight = undefined;
            this.objects.splice(0);
            this.depth = 0;
        };
        QuadTree.prototype.insert = function (p) {
            if (!this.bounds.containsRect(p))
                return false;
            if (this.depth < QuadTree.MAX_DEPTH && (this.topLeft != undefined || this.objects.length >= QuadTree.MAX_NODES)) {
                if (this.topLeft == undefined)
                    this.split();
                if (this.topLeft.insert(p) ||
                    this.topRight.insert(p) ||
                    this.bottomLeft.insert(p) ||
                    this.bottomRight.insert(p))
                    return true;
            }
            this.objects.push(p);
            return true;
        };
        QuadTree.prototype.split = function () {
            var w = this.bounds.width / 2, h = this.bounds.height / 2, x = this.bounds.x, y = this.bounds.y;
            this.topLeft = new QuadTree(new Rectangle_1.Rectangle(x, y, w, h));
            this.topRight = new QuadTree(new Rectangle_1.Rectangle(x + w, y, w, h));
            this.bottomLeft = new QuadTree(new Rectangle_1.Rectangle(x, y - h, w, h));
            this.bottomRight = new QuadTree(new Rectangle_1.Rectangle(x + w, y - h, w, h));
            for (var _i = 0, _a = this.objects; _i < _a.length; _i++) {
                var o = _a[_i];
                if (this.topLeft.insert(o) ||
                    this.topRight.insert(o) ||
                    this.bottomRight.insert(o) ||
                    this.bottomLeft.insert(o))
                    this.objects.splice(this.objects.indexOf(o), 1);
            }
        };
        QuadTree.prototype.retrieve = function (range, objects) {
            if (objects === void 0) { objects = []; }
            if (!this.bounds.intersects(range, 0))
                return objects;
            for (var _i = 0, _a = this.objects; _i < _a.length; _i++) {
                var o = _a[_i];
                if (math_1.intersects(range.x, range.y, range.width, range.height, o.x, o.y, o.width, o.height, 0))
                    objects.push(o);
            }
            if (this.topLeft == undefined)
                return objects;
            this.topLeft.retrieve(range, objects);
            this.topRight.retrieve(range, objects);
            this.bottomLeft.retrieve(range, objects);
            this.topLeft.retrieve(range, objects);
            return objects;
        };
        return QuadTree;
    }());
    QuadTree.MAX_NODES = 4;
    QuadTree.MAX_DEPTH = 4;
    exports.default = QuadTree;
});
