var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../util/Grid", "../scene/PlayScene", "../util/Generator"], function (require, exports, Grid_1, PlayScene_1, Generator_1) {
    "use strict";
    var Sprite = PIXI.Sprite;
    var Container = PIXI.Container;
    var Map = (function (_super) {
        __extends(Map, _super);
        function Map(tileWidth, tileHeight) {
            var _this = _super.call(this) || this;
            _this.grid = new Grid_1.default(tileWidth, tileHeight);
            var g = new Generator_1.default();
            g.grid = _this.grid;
            g.generate();
            var TS = PlayScene_1.default.TILE_SIZE;
            _this.width = tileWidth * TS;
            _this.height = tileHeight * TS;
            _this.tileWidth = tileWidth;
            _this.tileHeight = tileHeight;
            _this.redraw();
            return _this;
        }
        Map.prototype.redraw = function () {
            var textures = [
                PIXI.loader.resources["blank"].texture,
                PIXI.loader.resources["wall1"].texture
            ];
            var TS = PlayScene_1.default.TILE_SIZE;
            for (var x = 0; x < this.tileWidth; x++)
                for (var y = 0; y < this.tileHeight; y++) {
                    var t = this.grid.tileAt(x, y);
                    var s = new Sprite(textures[t]);
                    s.position.set(x * TS, y * TS);
                    this.addChild(s);
                }
        };
        return Map;
    }(Container));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Map;
});
