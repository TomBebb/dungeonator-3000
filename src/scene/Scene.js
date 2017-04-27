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
define(["require", "exports", "../util/geom/Point", "../main"], function (require, exports, Point_1, main_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Container = PIXI.Container;
    var Scene = (function (_super) {
        __extends(Scene, _super);
        function Scene() {
            var _this = _super.call(this) || this;
            _this.ui = new Container();
            _this.nonUi = new Container();
            _this.events = new Map();
            _this.addChild(_this.nonUi);
            _this.addChild(_this.ui);
            var r = main_1.default.instance.renderer;
            _this.nonUi.position.set(r.width / 2, r.height / 2);
            return _this;
        }
        Scene.prototype.addUi = function (elem) {
            this.ui.addChild(elem);
        };
        Scene.prototype.addNonUi = function (elem) {
            this.nonUi.addChild(elem);
        };
        Scene.prototype.removeNonUi = function (elem) {
            this.nonUi.removeChild(elem);
        };
        Scene.prototype.setCamera = function (x, y) {
            this.nonUi.pivot.set(x, y);
        };
        Scene.prototype.getCamera = function () {
            return this.nonUi.pivot;
        };
        Scene.prototype.fromGlobal = function (p) {
            var r = main_1.default.instance.renderer, c = this.getCamera();
            return new Point_1.Point(c.x - r.width / 2 + p.x, c.y - r.height / 2 + p.y);
        };
        Scene.prototype.update = function (dt) {
            dt;
        };
        Scene.prototype.advance = function (scene, destructive) {
            if (destructive === void 0) { destructive = true; }
            var r = main_1.default.instance.renderer;
            r.view.style.cursor = 'default';
            main_1.default.instance.scene = scene;
            if (destructive)
                this.destroy();
        };
        Scene.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            var events = this.events.keys();
            var v;
            while (!(v = events.next()).done) {
                var k = v.value;
                window.removeEventListener(k, this.events.get(k));
            }
        };
        Scene.prototype.addEvent = function (name, cb) {
            window.addEventListener(name, cb);
            this.events.set(name, cb);
        };
        Scene.prototype.removeEvent = function (name) {
            var cb = this.events.get(name);
            this.events.delete(name);
            window.removeEventListener(name, cb);
        };
        return Scene;
    }(Container));
    exports.default = Scene;
});
