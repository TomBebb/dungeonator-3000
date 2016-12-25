///<reference path='../util/immutable.d.ts'/>
import { Rectangle, Point, pointHash, pointEq } from "../util/math";
import Grid from "../util/Grid";
import PlayScene from "../scene/PlayScene";
import Main from "../main";
import Generator from "../util/Generator";
import { manhattan } from "../path/heuristic"; 
import Sprite = PIXI.Sprite;
import Container = PIXI.Container;
import Texture = PIXI.Texture;

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
    isValidPosition(x: number, y: number): boolean {
        return this.grid.isValidPosition(x / PlayScene.TILE_SIZE, y / PlayScene.TILE_SIZE);
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
                const t = this.grid.tileAt(x, y);
                const s = new Sprite(textures[t]);
                s.position.set(x * TS, y * TS);
                this.addChild(s);
            }
    }
}