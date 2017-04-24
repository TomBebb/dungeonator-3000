///<reference path='../pixi.d.ts'/>
import PlayScene from "../scene/PlayScene";
import Grid from "../util/geom/Grid";
import Generator from "../util/Generator";
import { Rectangle } from "../util/geom/Rectangle";
import QuadTree from "../util/geom/QuadTree";
import Sprite = PIXI.Sprite;
import Container = PIXI.Container;

/// A room (a rectangle on the map that is empty inside)
export class Room extends Rectangle {
    /// The index into `grid.rooms` this room is
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

    /// The quad tree the rooms are stored in, used to speed up determining
    /// which room (if any) an entity has moved to.
    readonly quadTree: QuadTree<Room>;

    constructor(tileWidth: number, tileHeight: number) {
        super();
        this.grid = new Grid(tileWidth, tileHeight);

        const TS = PlayScene.TILE_SIZE;
        // Initialise the grid
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.cacheAsBitmap = true;
        // Make quad tree for rooms
        const bounds = new Rectangle(0, 0, tileWidth * TS, tileHeight * TS);
        this.quadTree = new QuadTree<Room>(bounds);
        this.reset();
    }
    /// Reset the grid and generate a dungeon floor on it again.
    reset() {
        // Clear the rooms
        this.grid.rooms.splice(0);
        // Make a new generator.
        const g = new Generator(this.grid);
        // Generate on the gird
        g.generate();
        const TS = PlayScene.TILE_SIZE;
        // Clear the quad tree
        this.quadTree.clear();
        // Generate rooms and add to quad tree
        for (let i = 0; i < this.grid.rooms.length; i++) {
            const r = this.grid.rooms[i];
            // Make room by scaling grid room by tile size
            const rm = new Room(r.x * TS, r.y * TS, r.width * TS, r.height * TS);
            rm.index = i;
            // Insert into quadtree
            this.quadTree.insert(rm);
        }
        // Redraw this map
        this.redraw();
    }
    /// Returns true when (x, y) is a valid point on the underlying `grid`.
    isValid(x: number, y: number): boolean {
        return this.grid.isValid((x - this.x) / PlayScene.TILE_SIZE, (y - this.y) / PlayScene.TILE_SIZE);
    }
    /// Returns true when (x, y) is a walkable (valid and empty) point on the underlying `grid`.
    canWalk(x: number, y: number): boolean {
        return this.grid.canWalk((x - this.x) / PlayScene.TILE_SIZE, (y - this.y) / PlayScene.TILE_SIZE);
    }
    /// Returns true when (x, y) is a non-empty tile on the underlying `grid`.
    isNotEmpty(x: number, y: number): boolean {
        return this.grid.isNotEmpty((x - this.x) / PlayScene.TILE_SIZE, (y - this.y) / PlayScene.TILE_SIZE);
    }
    /// Makes sprites for each individual tile.
    redraw() {
        // Load textures
        const textures = [
            PIXI.loader.resources["blank"].texture,
            PIXI.loader.resources["wall1"].texture
        ];
        // Remove already generated tiles.
        this.removeChildren();
        // Delete cached bitmap
        this.cacheAsBitmap = false;
        const TS = PlayScene.TILE_SIZE;
        // For each tile in the grid
        for (let x = 0; x < this.tileWidth; x++)
            for (let y = 0; y < this.tileHeight; y++) {
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