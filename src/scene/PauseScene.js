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
define(["require", "exports", "../main", "./Scene", "./TitleScene"], function (require, exports, main_1, Scene_1, TitleScene_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Graphics = PIXI.Graphics;
    var Text = PIXI.Text;
    var PauseScene = (function (_super) {
        __extends(PauseScene, _super);
        function PauseScene(scene) {
            var _this = _super.call(this) || this;
            _this.overlay = new Graphics();
            _this.paused = new Text("Paused", {
                align: 'centre',
                fontSize: 60,
                fill: 'white'
            });
            _this.detail = new Text("", {
                align: 'centre',
                fontSize: 20,
                fill: 'white'
            });
            var r = main_1.default.instance.renderer;
            _this.paused.position.set((r.width - _this.paused.width) / 2, (r.height - _this.paused.height) / 2);
            _this.input = undefined;
            _this.scene = scene;
            _this.addChild(scene);
            _this.addChild(_this.overlay);
            _this.overlay.beginFill(0, 0.35);
            _this.overlay.drawRect(0, 0, r.width, r.height);
            _this.overlay.endFill();
            _this.addChild(_this.paused);
            _this.addChild(_this.detail);
            _this.addEvent("mousedown", _this.resume.bind(_this));
            _this.addEvent("keydown", function (e) {
                if (e.repeat)
                    return;
                if (e.keyCode == 27)
                    _this.advanceTitle();
                else
                    _this.resume();
            });
            _this.cacheAsBitmap = true;
            return _this;
        }
        Object.defineProperty(PauseScene.prototype, "input", {
            set: function (v) {
                switch (v) {
                    case "mouse":
                        this.detail.text = "Click to resume";
                        break;
                    case "gamepad":
                        this.detail.text = "Press Start to resume, or Select to exit";
                        break;
                    default:
                        this.detail.text = "Press Enter or Space to resume, or Escape to exit";
                }
                var r = main_1.default.instance.renderer;
                this.detail.position.set((r.width - this.detail.width) / 2, this.paused.y + this.paused.height * 2);
            },
            enumerable: true,
            configurable: true
        });
        PauseScene.prototype.advanceTitle = function () {
            this.advance(new TitleScene_1.default(), true);
        };
        PauseScene.prototype.resume = function () {
            this.advance(this.scene, false);
        };
        PauseScene.prototype.update = function (dt) {
            _super.prototype.update.call(this, dt);
            var gps = navigator.getGamepads();
            for (var _i = 0, gps_1 = gps; _i < gps_1.length; _i++) {
                var gp = gps_1[_i];
                if (gp == null)
                    continue;
                if (gp.buttons[8].pressed)
                    this.advanceTitle();
                else if (gp.buttons[9].pressed)
                    this.resume();
            }
        };
        return PauseScene;
    }(Scene_1.default));
    exports.default = PauseScene;
});
