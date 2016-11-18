import Game from "./Game";
import {Rectangle, random} from "./math";

export default class Grid {
	protected readonly buffer: Int8Array;
	protected static readonly COLORS: string[] = [
		"white",
		"red",
		"green",
		"blue",
		"yellow",
		"orange",
		"purple",
		"gray",
		"black"
	];
	readonly canvas: HTMLCanvasElement;
	private readonly context: CanvasRenderingContext2D;
	readonly width: number;
	readonly height: number;
	constructor(width: number, height: number) {
		this.canvas = document.createElement("canvas");
		this.canvas.width = width * Game.TILE_SIZE;
		this.canvas.height = height * Game.TILE_SIZE;
		this.context = this.canvas.getContext("2d");
		this.buffer = new Int8Array(width * height);
		this.width = width;
		this.height = height;
		document.body.appendChild(this.canvas);
		this.randomise();
		this.internalDraw();
	}
	randomise() {
		for(var x = 0; x < this.width; x++)
			for(var y = 0; y < this.height; y++)
				this.buffer[this.index(x, y)] = random(0, Grid.COLORS.length);
	}
	fill(r: Rectangle, c: number) {
		c = c % Grid.COLORS.length;
		for(var x = r.x; x < r.x + r.width; x++)
			for(var y = r.y; y < r.y + r.height; y++)
				this.buffer[this.index(x, y)] = c;
	}
	clear(index: number = 0) {
		this.buffer.fill(index);
	}
	protected index(x: number, y: number) {
		return x + y * this.width;
	}
	internalDraw() {
		for(var x = 0; x < this.width; x++)
			for(var y = 0; y < this.height; y++) {
				this.context.fillStyle = Grid.COLORS[this.buffer[this.index(x, y)]];
				this.context.fillRect(x * Game.TILE_SIZE, y * Game.TILE_SIZE, Game.TILE_SIZE, Game.TILE_SIZE);
			}
	}
	render(c: CanvasRenderingContext2D, x: number, y: number) {
		c.drawImage(this.canvas, x, y);
	}
}