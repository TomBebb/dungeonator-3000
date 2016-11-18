import { KeyboardInput, Input, toVector } from "./input"; 
import Game from "./Game";

export default class Player {
	public x: number = 0;
	public y: number = 0;
	public readonly delay: number = 0.1;
	private sinceLast: number = 0;
	private input: Input;
	constructor(game: Game) {
		this.input = new KeyboardInput(game);
	}

	public update(dt: number) {
		this.sinceLast += dt;
		if(this.sinceLast > this.delay) {
			let [dx, dy] = toVector(this.input.dir);
			this.sinceLast -= this.delay;
			this.x += dx;
			this.y += dy;
		}
	}

	public draw(c: CanvasRenderingContext2D) {
		c.strokeStyle = "black";
		c.strokeRect(this.x * Game.TILE_SIZE, this.y * Game.TILE_SIZE, Game.TILE_SIZE, Game.TILE_SIZE);
	}
}