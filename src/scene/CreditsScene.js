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
define(["require", "exports", "../main", "./Scene"], function (require, exports, main_1, Scene_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Text = PIXI.Text;
    var CreditsScene = (function (_super) {
        __extends(CreditsScene, _super);
        function CreditsScene(from) {
            var _this = _super.call(this) || this;
            _this.from = from;
            var r = main_1.default.instance.renderer;
            _this.text = new Text(CreditsScene.TEXT, {
                align: 'left',
                fontFamily: 'sans',
                fontSize: 30,
                wordWrap: true,
                fill: 'white',
                wordWrapWidth: r.width - 20,
                lineHeight: 50
            });
            _this.text.x = (r.width - _this.text.width) / 2;
            _this.text.y = r.height;
            _this.text.scale.set(1, 1);
            _this.text.cacheAsBitmap = true;
            _this.ui.scale.set(1, 1);
            _this.addUi(_this.text);
            return _this;
        }
        CreditsScene.prototype.update = function (dt) {
            this.text.y -= dt * CreditsScene.SPEED;
            if (this.text.y + this.text.height < 0) {
                this.advance(this.from, true);
            }
        };
        return CreditsScene;
    }(Scene_1.default));
    CreditsScene.TEXT = "Programming: Tom Bebbington\nCoin Sprite: Puddin (OpenGameArt)";
    CreditsScene.SPEED = 100;
    exports.default = CreditsScene;
});
