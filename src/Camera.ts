import Game from "./Game";
import { Sprite } from "./entities";

/// Manages the transformations that apply to the canvas
export default class Camera {
	follow: Sprite;
	zoom: number = 1;

	get x() {
		return (this.follow.x + 0.5) * Game.TILE_SIZE;
	}

	get y() {
		return (this.follow.y + 0.5) * Game.TILE_SIZE;
	}

	constructor(follow: Sprite) {
		this.follow = follow;
	}

	apply(c: CanvasRenderingContext2D) {
		c.translate(-this.x + c.canvas.width / 2, -this.y + c.canvas.height / 2);
		this.zoom += 0.0001;
	}
}