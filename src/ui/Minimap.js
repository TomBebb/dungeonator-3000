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
define(["require", "exports", "../scene/PlayScene"], function (require, exports, PlayScene_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Graphics = PIXI.Graphics;
    var Minimap = (function (_super) {
        __extends(Minimap, _super);
        function Minimap(grid, players, ladder) {
            var _this = _super.call(this) || this;
            _this.grid = grid;
            _this.alpha = 0.5;
            _this.players = players;
            _this.ladder = ladder;
            _this.redraw();
            return _this;
        }
        Minimap.prototype.drawSquare = function (x, y, radius) {
            this.drawRect(x - radius, y - radius, radius * 2, radius * 2);
        };
        Minimap.prototype.redraw = function () {
            var size = Math.max(this.grid.width, this.grid.height);
            var SF = Minimap.SIZE / size;
            this.cacheAsBitmap = false;
            this.clear();
            this.beginFill(Minimap.FILL);
            for (var x = 0; x < this.grid.width; x++)
                for (var y = 0; y < this.grid.height; y++)
                    if (this.grid.canWalk(x, y))
                        this.drawRect(x * SF, y * SF, SF, SF);
            this.endFill();
            var NSF = SF / PlayScene_1.default.TILE_SIZE;
            this.beginFill(Minimap.PLAYER);
            var R = Minimap.RADIUS;
            for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
                var p = _a[_i];
                this.drawSquare(p.x * NSF, p.y * NSF, R);
            }
            this.endFill();
            this.beginFill(Minimap.LADDER);
            this.drawSquare(this.ladder.x * NSF, this.ladder.y * NSF, R);
            this.endFill();
            this.cacheAsBitmap = true;
        };
        return Minimap;
    }(Graphics));
    Minimap.FILL = 0xffffff;
    Minimap.LADDER = 0x0000cc;
    Minimap.PLAYER = 0x00cc00;
    Minimap.RADIUS = 2;
    Minimap.SIZE = 128;
    exports.default = Minimap;
});
