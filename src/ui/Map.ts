import PlayScene from "../scene/PlayScene";
import Grid from "../util/geom/Grid";
import Generator from "../util/Generator";
import { BaseRectangle, Rectangle } from "../util/geom/Rectangle";
import QuadTree from "../util/geom/QuadTree";
import Sprite = PIXI.Sprite;
import Container = PIXI.Container;

export class Room extends Rectangle {
    index: number;
}

/// Displays a `Grid` by associating each byte with a kind of tile.
export default class Map extends Container {
    /// The width of the grid in tiles.
    readonly tileWidth: number;
    /// The height of the grid in tiles.
    readonly tileHeight: number;
    /// The grid which will be displayed.
    readonly grid: Grid;

    readonly quadTree: QuadTree<Room>;
    
    constructor(tileWidth: number, tileHeight: number) {
        super();
        this.grid = new Grid(tileWidth, tileHeight);

        const TS = PlayScene.TILE_SIZE;
        // Compute the absolute width
        this.width = tileWidth * TS;
        this.height = tileHeight * TS;
        // Initialise the grid
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.cacheAsBitmap = true;
        const bounds = new Rectangle(0, 0, this.width, this.height);
        this.quadTree = new QuadTree<Room>(bounds);
        this.reset();
    }
    reset() {
        // Clear the rooms
        this.grid.rooms.splice(0);
        const g = new Generator(this.grid);
        g.generate();
        const TS = PlayScene.TILE_SIZE;
        this.quadTree.clear();
        // Add rooms to quad tree
        for(let i = 0; i < this.grid.rooms.length; i++) {
            const r = this.grid.rooms[i];
            const rm = new Room(r.x * TS, r.y * TS, r.width * TS, r.height * TS);
            rm.index = i;
            this.quadTree.insert(rm);
        }
        // Redraw this map
        this.redraw();
    }
    retrieve(arr: Room[], r: BaseRectangle) {
        this.quadTree.retrieve(arr, r);
    }
    /// Returns true when `p` is a valid point on the underlying `grid`.
    isValid(x: number, y: number): boolean {
        return this.grid.isValid((x - this.x) / PlayScene.TILE_SIZE, (y - this.y) / PlayScene.TILE_SIZE);
    }
    canWalk(x: number, y: number): boolean {
        return this.grid.canWalk((x - this.x) / PlayScene.TILE_SIZE, (y - this.y) / PlayScene.TILE_SIZE);
    }
    isNotEmpty(x: number, y: number): boolean {
        return this.grid.isNotEmpty((x - this.x) / PlayScene.TILE_SIZE, (y - this.y) / PlayScene.TILE_SIZE);
    }
    /// Makes sprites for each individual tile.
    redraw() {
        // Load images
        const textures = [
            PIXI.loader.resources["blank"].texture,
            PIXI.loader.resources["wall1"].texture
        ];
        this.removeChildren();
        // Delete cached bitmap
        this.cacheAsBitmap = false;
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
        // Done drawing, cache as bitmap
        this.cacheAsBitmap = true;
    }
}