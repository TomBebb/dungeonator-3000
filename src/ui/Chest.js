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
define(["require", "exports", "./Item", "./Entity", "../util/input"], function (require, exports, Item_1, Entity_1, input_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Rectangle = PIXI.Rectangle;
    var Texture = PIXI.Texture;
    var Chest = (function (_super) {
        __extends(Chest, _super);
        function Chest() {
            var _this = this;
            var r = PIXI.loader.resources;
            var t = r['chests'].texture.baseTexture;
            _this = _super.call(this, new Texture(t, new Rectangle(16, 0, 16, 16))) || this;
            _this.shutTexture = _this.texture;
            _this.openTexture = new Texture(t, new Rectangle(0, 0, 16, 16));
            return _this;
        }
        Object.defineProperty(Chest.prototype, "open", {
            get: function () {
                return this.texture == this.openTexture;
            },
            enumerable: true,
            configurable: true
        });
        Chest.prototype.interact = function (e) {
            if (!this.open && !(e.input instanceof input_1.FollowInput)) {
                this.texture = this.openTexture;
                this.coin = new Entity_1.Coin(e.scene, this.x, this.y - 16);
                e.scene.coins += 1;
                e.scene.addNonUi(this.coin);
            }
        };
        Chest.prototype.update = function (dt) {
            if (this.coin != undefined)
                this.coin.update(dt);
        };
        return Chest;
    }(Item_1.default));
    exports.default = Chest;
});
