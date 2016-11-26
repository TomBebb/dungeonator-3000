import { KeyboardControl, FollowControl, Control, toVector } from "./control";
import Game from "./Game";

/// An object that has a physical position and can be drawn to the screen.
export abstract class Sprite {
	x: number;
	y: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	/// Draw the sprite to the screen.
	abstract draw(c: CanvasRenderingContext2D): void;
	/// Update the sprite with a delta (in seconds).
	update(_: number) {}
}

/// A sprite that can move.
export class Entity<C extends Control> extends Sprite {
	/// The delay between moves of the entity, in seconds
	readonly delay: number;
	/// The source of input that controls this entity.
	readonly control: C;
	/// The game instance the entity is attached to.
	readonly game: Game;
	readonly color: string;
	/// The number of seconds since the last movement of the entity.
	sinceLast: number = 0;

	constructor(game: Game, control: C, delay: number = 0.5, x: number = 0, y: number = 0, color: string = "green") {
		super(x, y);
		this.delay = delay;
		this.game = game;
		this.control = control;
		if(this.control instanceof FollowControl)
			this.control.self = this as Entity<any>;
		this.color = color;
	}

	update(dt: number) {
		this.sinceLast += dt;
		if(this.sinceLast > this.delay) {
			// Compute the next position
			let [dx, dy] = toVector(this.control.dir);
			this.sinceLast -= this.delay;
			let [nx, ny] = [this.x + dx, this.y + dy];
			// Check if the computed next position is valid
			if(this.game.isValidPosition(nx, ny)) {
				this.x = nx;
				this.y = ny;
			}
		}
	}

	draw(c: CanvasRenderingContext2D) {
		c.fillStyle = this.color;
		c.fillRect(this.x * Game.TILE_SIZE, this.y * Game.TILE_SIZE, Game.TILE_SIZE, Game.TILE_SIZE);
	}
	/// Create the default player
	static defaultPlayer(game: Game): Entity<KeyboardControl> {
		return new Entity(game, new KeyboardControl(game), 0.5, 0, 0, "green");
	}
	/// Create the default enemy
	static defaultEnemy(game: Game): Entity<FollowControl> {
		return new Entity(game, new FollowControl(game), 1.0, 5, 5, "red");
	}
}
