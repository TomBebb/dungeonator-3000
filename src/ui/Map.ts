import PlayScene from "../scene/PlayScene";
import Grid from "../util/geom/Grid";
import Generator from "../util/Generator";
import Item from "./Item";
import Sprite = PIXI.Sprite;
import Container = PIXI.Container;

/// Displays a `Grid` by associating each byte with a kind of tile.
export default class Map extends Container {
    /// The width of the grid in tiles.
    readonly tileWidth: number;
    /// The height of the grid in tiles.
    readonly tileHeight: number;
    /// The grid which will be displayed.
    readonly grid: Grid;
    
    readonly items: Item[] = [];
    constructor(tileWidth: number, tileHeight: number) {
        super();
        this.grid = new Grid(tileWidth, tileHeight);
        const g = new Generator();
        g.grid = this.grid;
        g.generate();
        const TS = PlayScene.TILE_SIZE;
        // Compute the absolute width
        this.width = tileWidth * TS;
        this.height = tileHeight * TS;
        // Initialise the grid
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        for(const item of this.items)
            this.addChild(item);
        this.redraw();
    }
    /// Returns true when `p` is a valid point on the underlying `grid`.
    isValid(x: number, y: number): boolean {
        return this.grid.isValid(x / PlayScene.TILE_SIZE, y / PlayScene.TILE_SIZE);
    }
    isEmpty(x: number, y: number): boolean {
        return this.grid.isEmpty(x / PlayScene.TILE_SIZE, y / PlayScene.TILE_SIZE);
    }
    isNotEmpty(x: number, y: number): boolean {
        return this.grid.isNotEmpty(x / PlayScene.TILE_SIZE, y / PlayScene.TILE_SIZE);
    }
    /// Makes sprites for each individual tile.
    redraw() {
        // Load images
        const textures = [
            PIXI.loader.resources["blank"].texture,
            PIXI.loader.resources["wall1"].texture
        ];
        const TS = PlayScene.TILE_SIZE;
        // For each tile in the grid
        for(let x = 0; x < this.tileWidth; x++)
            for(let y = 0; y < this.tileHeight; y++) {
                // Get the byte at `x`, `y`.
                const t = this.grid.tileAt(x, y);
                // Make a sprite from the `t`th index in `textures`.
                const s = new Sprite(textures[t]);
                // Set the position appropriately.
                s.position.set(x * TS, y * TS);
                // Add it as a child so it is drawn with the map.
                this.addChild(s);
            }
    }
}