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
    var LoadingScene = (function (_super) {
        __extends(LoadingScene, _super);
        function LoadingScene() {
            var _this = _super.call(this) || this;
            _this.sinceAddDot = 0;
            var r = main_1.default.instance.renderer;
            _this.text = new Text(LoadingScene.TEXT, {
                align: 'left',
                fontFamily: 'sans',
                fontSize: r.height / 2,
                fill: 'white'
            });
            _this.text.x = (r.width - _this.text.width) / 2;
            _this.text.y = (r.height - _this.text.height) / 2;
            _this.text.scale.set(1, 1);
            _this.cacheAsBitmap = true;
            _this.ui.scale.set(1, 1);
            _this.addUi(_this.text);
            return _this;
        }
        LoadingScene.prototype.update = function (dt) {
            this.sinceAddDot += dt;
            if (this.sinceAddDot >= LoadingScene.DOT_INTERVAL) {
                this.sinceAddDot -= LoadingScene.DOT_INTERVAL;
                this.cacheAsBitmap = false;
                this.text.text += ".";
                this.cacheAsBitmap = true;
            }
        };
        return LoadingScene;
    }(Scene_1.default));
    LoadingScene.DOT_INTERVAL = 0.01;
    LoadingScene.TEXT = "Loading";
    exports.default = LoadingScene;
});
