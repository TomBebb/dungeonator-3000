import Game from "./Game";
import { Sprite } from "./entities";

/// Manages the transformations that apply to the canvas
export default class Camera {
    /// The sprite the camera will follow
    follow: Sprite | undefined;
    zoom: number = 1;

    get x(): number {
        return this.follow === undefined ? 0 : (this.follow.x + 0.5) * Game.TILE_SIZE;
    }

    get y(): number {
        return this.follow === undefined ? 0 : (this.follow.y + 0.5) * Game.TILE_SIZE;
    }

    constructor(follow?: Sprite) {
        this.follow = follow;
    }

    apply(c: CanvasRenderingContext2D) {
        c.translate(c.canvas.width / 2, c.canvas.height / 2);
        c.scale(this.zoom, this.zoom);
        c.translate(-this.x, -this.y);
    }
}
