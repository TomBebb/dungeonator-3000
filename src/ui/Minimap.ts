///<reference path='../pixi.d.ts'/>
import Graphics = PIXI.Graphics;
import Grid from "../util/geom/Grid";
import PlayScene from "../scene/PlayScene";
import Entity from "./entities";
import Ladder from "./Ladder";

export default class Minimap extends Graphics {
    private static readonly FILL: number = 0xffffff;
    private static readonly LADDER: number = 0x0000cc;
    private static readonly PLAYER: number = 0x00cc00;
    private static readonly PLAYER_RADIUS: number = 2;
    private grid: Grid;
    private players: Entity<any>[];
    private ladder: Ladder;
    constructor(grid: Grid, players: Entity<any>[], ladder: Ladder) {
        super();
        this.grid = grid;
        this.alpha = 0.5;
        this.players = players;
        this.ladder = ladder;
        this.redraw();
    }
    redraw() {
        this.cacheAsBitmap = false;
        this.clear();
        this.beginFill(Minimap.FILL);
        for(let x = 0; x < this.grid.width; x++)
            for(let y = 0; y < this.grid.height; y++)
                if(this.grid.canWalk(x, y))
                    this.drawRect(x, y, 1, 1);
        this.endFill();
        this.beginFill(Minimap.PLAYER);
        const PR = Minimap.PLAYER_RADIUS;
        for(const p of this.players)
            this.drawRect(p.x / PlayScene.TILE_SIZE - PR, p.y / PlayScene.TILE_SIZE - PR, PR * 2, PR * 2);
        this.endFill();
        this.beginFill(Minimap.LADDER);
        this.drawRect(this.ladder.x / PlayScene.TILE_SIZE - PR, this.ladder.y / PlayScene.TILE_SIZE - PR, PR * 2, PR * 2);
        this.endFill();
        this.cacheAsBitmap = true;
    }
}