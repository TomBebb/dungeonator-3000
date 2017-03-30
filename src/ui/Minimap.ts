///<reference path='../pixi.d.ts'/>
import Graphics = PIXI.Graphics;
import Grid from "../util/geom/Grid";
import PlayScene from "../scene/PlayScene";
import Entity from "./entities";
import Ladder from "./Ladder";

/// Displays a miniature view of the map in the top-right corner of the screen.
export default class Minimap extends Graphics {
    /// The color to fill wall tiles with.
    private static readonly FILL: number = 0xffffff;
    /// The color to draw a ladder as.
    private static readonly LADDER: number = 0x0000cc;
    /// The color to draw a player as.
    private static readonly PLAYER: number = 0x00cc00;
    /// The radius to draw players and the ladder with.
    private static readonly RADIUS: number = 2;
    /// The number of pixels this minimap should take up (in width and height).
    private static readonly SIZE: number = 64;
    /// The grid to be displayed.
    private grid: Grid;
    /// The players array.
    private players: Entity<any>[];
    /// The ladder.
    private ladder: Ladder;
    constructor(grid: Grid, players: Entity<any>[], ladder: Ladder) {
        super();
        this.grid = grid;
        this.alpha = 0.5;
        this.players = players;
        this.ladder = ladder;
        this.redraw();
    }
    /// Redraw the minimap
    redraw() {
        /// Compute max width \ height in pixels
        const size: number = Math.max(this.grid.width, this.grid.height);
        // Compute the scale factor to apply to x, y values to map from grid to minimap.
        const SF = Minimap.SIZE / size;
        // Delete the cached image
        this.cacheAsBitmap = false;
        // Clear the image
        this.clear();
        // Fill in the empty tiles
        this.beginFill(Minimap.FILL);
        for (let x = 0; x < this.grid.width; x++)
            for (let y = 0; y < this.grid.height; y++)
                if (this.grid.canWalk(x, y))
                    this.drawRect(x * SF, y * SF, 1, 1);
        this.endFill();
        // Fill in the players
        this.beginFill(Minimap.PLAYER);
        const R = Minimap.RADIUS;
        for (const p of this.players)
            this.drawCircle(p.x, p.y, R);
        this.endFill();
        // Fill in the ladder
        this.beginFill(Minimap.LADDER);
        this.drawCircle(this.ladder.x / PlayScene.TILE_SIZE, this.ladder.y / PlayScene.TILE_SIZE, R);
        this.endFill();
        // Cache this again, now that it has been re-drawn
        this.cacheAsBitmap = true;
    }
}