import { Point } from "../util/math";
import Grid from "../util/Grid";
import PlayScene from "../scene/PlayScene";
import Generator from "../util/Generator";
import Sprite = PIXI.Sprite;
import Container = PIXI.Container;

/// A 2D Grid
export default class Map extends Container {
    /// The width of the grid in tiles.
    readonly tileWidth: number;
    /// The height of the grid in tiles.
    readonly tileHeight: number;
    readonly grid: Grid;
    constructor(tileWidth: number, tileHeight: number) {
        super();
        this.grid = new Grid(tileWidth, tileHeight);
        const g = new Generator();
        g.grid = this.grid;
        g.generate();
        const TS = PlayScene.TILE_SIZE;
        this.width = tileWidth * TS;
        this.height = tileHeight * TS;
        // Initialise the grid
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.redraw();
    }
    isValidAt(p: Point): boolean {
        return this.grid.isValidAt({x: p.x / PlayScene.TILE_SIZE, y: p.y / PlayScene.TILE_SIZE});
    }
    isEmptyAt(p: Point): boolean {
        return this.grid.isEmptyAt({x: p.x / PlayScene.TILE_SIZE, y: p.y / PlayScene.TILE_SIZE});
    }
    isNotEmptyAt(p: Point): boolean {
        return this.grid.isNotEmptyAt({x: p.x / PlayScene.TILE_SIZE, y: p.y / PlayScene.TILE_SIZE});
    }
    redraw() {
        // Load images
        const textures = [
            PIXI.loader.resources["blank"].texture,
            PIXI.loader.resources["wall1"].texture
        ];
        const TS = PlayScene.TILE_SIZE;
        for(let x = 0; x < this.tileWidth; x++)
            for(let y = 0; y < this.tileHeight; y++) {
                const t = this.grid.tileAt({x, y});
                const s = new Sprite(textures[t]);
                s.position.set(x * TS, y * TS);
                this.addChild(s);
            }
    }
}