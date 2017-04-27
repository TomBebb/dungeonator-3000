define(["require", "exports", "./scene/LoadingScene", "./scene/TitleScene"], function (require, exports, LoadingScene_1, TitleScene_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Main = (function () {
        function Main() {
            var _this = this;
            this.renderer = PIXI.autoDetectRenderer(1024, 640, {
                backgroundColor: 0x000000,
                antialias: false,
                roundPixels: true
            });
            Main.instance = this;
            this.renderer.view.tabIndex = 1;
            PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
            PIXI.loader.baseUrl = 'assets/';
            PIXI.loader
                .add("coins", "coins.png")
                .add("chests", "chests.png")
                .add("blank", "blank.png")
                .add("player", "player.png")
                .add("zombie", "zombies.png")
                .add("wall1", "wall1.png")
                .add("wall2", "wall2.png")
                .add("ladder", "ladder.png")
                .load(function (_) { return _this.scene.advance(new TitleScene_1.default(), true); });
            this.scene = new LoadingScene_1.default();
            setInterval(function () { return _this.scene.update(Main.DELTA); }, Main.DELTA * 1000);
            document.body.appendChild(this.renderer.view);
            this.render();
        }
        Main.prototype.render = function () {
            requestAnimationFrame(this.render.bind(this));
            this.renderer.render(this.scene);
        };
        return Main;
    }());
    Main.DELTA = 1 / 30;
    exports.default = Main;
    new Main().render();
});
