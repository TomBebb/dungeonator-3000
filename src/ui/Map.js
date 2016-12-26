define(["require", "exports", "../util/Grid", "../scene/PlayScene", "../util/Generator"], function (require, exports, Grid_1, PlayScene_1, Generator_1) {
    "use strict";
    var Sprite = PIXI.Sprite;
    var Container = PIXI.Container;
    class Map extends Container {
        constructor(tileWidth, tileHeight) {
            super();
            this.grid = new Grid_1.default(tileWidth, tileHeight);
            const g = new Generator_1.default();
            g.grid = this.grid;
            g.generate();
            const TS = PlayScene_1.default.TILE_SIZE;
            this.width = tileWidth * TS;
            this.height = tileHeight * TS;
            this.tileWidth = tileWidth;
            this.tileHeight = tileHeight;
            this.redraw();
        }
        isValidAt(p) {
            return this.grid.isValidAt({ x: p.x / PlayScene_1.default.TILE_SIZE, y: p.y / PlayScene_1.default.TILE_SIZE });
        }
        isEmptyAt(p) {
            return this.grid.isEmptyAt({ x: p.x / PlayScene_1.default.TILE_SIZE, y: p.y / PlayScene_1.default.TILE_SIZE });
        }
        redraw() {
            const textures = [
                PIXI.loader.resources["blank"].texture,
                PIXI.loader.resources["wall1"].texture
            ];
            const TS = PlayScene_1.default.TILE_SIZE;
            for (let x = 0; x < this.tileWidth; x++)
                for (let y = 0; y < this.tileHeight; y++) {
                    const t = this.grid.tileAt({ x, y });
                    const s = new Sprite(textures[t]);
                    s.position.set(x * TS, y * TS);
                    this.addChild(s);
                }
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Map;
});
