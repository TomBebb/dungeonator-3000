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
    /// The radius to draw a player with.
    private static readonly PLAYER_RADIUS: number = 2;
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
        // Delete the cached image
        this.cacheAsBitmap = false;
        // Clear the image
        this.clear();
        // Fill in the wall tiles
        this.beginFill(Minimap.FILL);
        for(let x = 0; x < this.grid.width; x++)
            for(let y = 0; y < this.grid.height; y++)
                if(this.grid.canWalk(x, y))
                    this.drawRect(x, y, 1, 1);
        this.endFill();
        // Fill inn the players
        this.beginFill(Minimap.PLAYER);
        const PR = Minimap.PLAYER_RADIUS;
        for(const p of this.players)
            this.drawCircle(p.x, p.y, PR);
        this.endFill();
        // Fill in the ladder
        this.beginFill(Minimap.LADDER);
        this.drawRect(this.ladder.x / PlayScene.TILE_SIZE - PR, this.ladder.y / PlayScene.TILE_SIZE - PR, PR * 2, PR * 2);
        this.endFill();
        // Cache this again, now that it has been re-drawn
        this.cacheAsBitmap = true;
    }
}