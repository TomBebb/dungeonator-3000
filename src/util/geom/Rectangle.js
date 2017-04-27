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
define(["require", "exports", "./Point", "../math"], function (require, exports, Point_1, math_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Rectangle = (function (_super) {
        __extends(Rectangle, _super);
        function Rectangle(x, y, w, h) {
            var _this = _super.call(this, x, y) || this;
            _this.width = w;
            _this.height = h;
            return _this;
        }
        Object.defineProperty(Rectangle.prototype, "centre", {
            get: function () {
                return new Point_1.Point(this.centreX, this.centreY);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "top", {
            get: function () {
                return this.y;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "centreY", {
            get: function () {
                return this.y + Math.floor(this.height / 2);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "bottom", {
            get: function () {
                return this.y + this.height;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "left", {
            get: function () {
                return this.x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "centreX", {
            get: function () {
                return this.x + Math.floor(this.width / 2);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "right", {
            get: function () {
                return this.x + this.width;
            },
            enumerable: true,
            configurable: true
        });
        Rectangle.prototype.contains = function (x, y) {
            return math_1.rectContains(this.x, this.y, this.width, this.height, x, y);
        };
        Rectangle.prototype.containsRect = function (other) {
            return math_1.rectContainsRect(this.x, this.y, this.width, this.height, other.x, other.y, other.width, other.height);
        };
        Rectangle.prototype.intersects = function (other, spacing) {
            return math_1.intersects(this.x, this.y, this.width, this.height, other.x, other.y, other.width, other.height, spacing);
        };
        return Rectangle;
    }(Point_1.Point));
    exports.Rectangle = Rectangle;
});
