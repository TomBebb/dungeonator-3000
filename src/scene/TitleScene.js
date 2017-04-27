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
define(["require", "exports", "../main", "./MenuScene", "../ui/Button", "./PlayScene", "./CreditsScene", "../util/save"], function (require, exports, main_1, MenuScene_1, Button_1, PlayScene_1, CreditsScene_1, save_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Text = PIXI.Text;
    var TitleScene = (function (_super) {
        __extends(TitleScene, _super);
        function TitleScene() {
            var _this = _super.call(this, "Dungeonator 3000", [
                new Button_1.default('Credits', function () { return new CreditsScene_1.default(_this); }, false),
                new Button_1.default('Play', function () { return new PlayScene_1.default(); }, true),
            ]) || this;
            var r = main_1.default.instance.renderer;
            var data = save_1.load();
            if (data != undefined) {
                var floor = new Text("Highest floor: " + data.maxFloor, {
                    fontSize: 40,
                    fill: 'white'
                });
                floor.position.set((r.width - floor.width) / 2, (r.height - floor.height) / 2);
                floor.cacheAsBitmap = true;
                _this.addUi(floor);
                var coins = new Text("Coins: " + data.coins, {
                    fontSize: 40,
                    fill: 'white'
                });
                coins.position.set((r.width - coins.width) / 2, r.height * 0.3);
                coins.cacheAsBitmap = true;
                _this.addUi(coins);
            }
            return _this;
        }
        return TitleScene;
    }(MenuScene_1.default));
    exports.default = TitleScene;
});
