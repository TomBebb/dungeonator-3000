import Graphics = PIXI.Graphics;
import Grid from "../util/geom/Grid";

export default class Minimap extends Graphics {
    private static readonly FILL: number = 0xffffff;
    private grid: Grid;
    constructor(grid: Grid) {
        super();
        this.grid = grid;
        this.alpha = 0.5;
        this.redraw();
    }
    redraw() {
        this.cacheAsBitmap = false;
        this.clear();
        for(let x = 0; x < this.grid.width; x++)
            for(let y = 0; y < this.grid.height; y++) {
                if(this.grid.canWalk(x, y)) {
                    this.beginFill(Minimap.FILL);
                    this.drawRect(x, y, 1, 1);
                    this.endFill();
                }
            }
        this.cacheAsBitmap = true;
    }
}