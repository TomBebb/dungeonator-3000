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
define(["require", "exports", "../scene/PlayScene", "../util/geom/Grid", "../util/Generator", "../util/geom/Rectangle", "../util/geom/QuadTree"], function (require, exports, PlayScene_1, Grid_1, Generator_1, Rectangle_1, QuadTree_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Sprite = PIXI.Sprite;
    var Container = PIXI.Container;
    var Room = (function (_super) {
        __extends(Room, _super);
        function Room() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Room;
    }(Rectangle_1.Rectangle));
    exports.Room = Room;
    var Map = (function (_super) {
        __extends(Map, _super);
        function Map(tileWidth, tileHeight) {
            var _this = _super.call(this) || this;
            _this.grid = new Grid_1.default(tileWidth, tileHeight);
            var TS = PlayScene_1.default.TILE_SIZE;
            _this.tileWidth = tileWidth;
            _this.tileHeight = tileHeight;
            _this.cacheAsBitmap = true;
            var bounds = new Rectangle_1.Rectangle(0, 0, tileWidth * TS, tileHeight * TS);
            _this.quadTree = new QuadTree_1.default(bounds);
            _this.reset();
            return _this;
        }
        Map.prototype.reset = function () {
            this.grid.rooms.splice(0);
            var g = new Generator_1.default(this.grid);
            g.generate();
            var TS = PlayScene_1.default.TILE_SIZE;
            this.quadTree.clear();
            for (var i = 0; i < this.grid.rooms.length; i++) {
                var r = this.grid.rooms[i];
                var rm = new Room(r.x * TS, r.y * TS, r.width * TS, r.height * TS);
                rm.index = i;
                this.quadTree.insert(rm);
            }
            this.redraw();
        };
        Map.prototype.isValid = function (x, y) {
            return this.grid.isValid((x - this.x) / PlayScene_1.default.TILE_SIZE, (y - this.y) / PlayScene_1.default.TILE_SIZE);
        };
        Map.prototype.canWalk = function (x, y) {
            return this.grid.canWalk((x - this.x) / PlayScene_1.default.TILE_SIZE, (y - this.y) / PlayScene_1.default.TILE_SIZE);
        };
        Map.prototype.isNotEmpty = function (x, y) {
            return this.grid.isNotEmpty((x - this.x) / PlayScene_1.default.TILE_SIZE, (y - this.y) / PlayScene_1.default.TILE_SIZE);
        };
        Map.prototype.redraw = function () {
            var textures = [
                PIXI.loader.resources["blank"].texture,
                PIXI.loader.resources["wall1"].texture
            ];
            this.removeChildren();
            this.cacheAsBitmap = false;
            var TS = PlayScene_1.default.TILE_SIZE;
            for (var x = 0; x < this.tileWidth; x++)
                for (var y = 0; y < this.tileHeight; y++) {
                    var t = this.grid.tileAt(x, y);
                    var s = new Sprite(textures[t]);
                    s.position.set(x * TS, y * TS);
                    this.addChild(s);
                }
            this.cacheAsBitmap = true;
        };
        return Map;
    }(Container));
    exports.default = Map;
});
