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
define(["require", "exports", "./Item"], function (require, exports, Item_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Ladder = (function (_super) {
        __extends(Ladder, _super);
        function Ladder() {
            var _this = this;
            var r = PIXI.loader.resources;
            _this = _super.call(this, r['ladder'].texture) || this;
            return _this;
        }
        Ladder.prototype.interact = function (e) {
            e.scene.advanceFloor();
        };
        return Ladder;
    }(Item_1.default));
    exports.default = Ladder;
});
