import Game from "./Game";
import { Rectangle } from "./math";

/// A 2D Grid
export default class Grid {
	private static readonly EMPTY: string = "white";
	private static readonly FILLED: string = "black";
	/// The byte array the tiles are stored in.
	readonly canvas: HTMLCanvasElement;
	private readonly context: CanvasRenderingContext2D;
	/// The byte array the tiles are stored in.
	protected readonly tiles: Int8Array;
	/// The width of the grid in tiles.
	readonly width: number;
	/// The height of the grid in tiles.
	readonly height: number;
	constructor(width: number, height: number) {
		this.canvas = document.createElement("canvas");
		this.canvas.width = width * Game.TILE_SIZE;
		this.canvas.height = height * Game.TILE_SIZE;
		this.context = this.canvas.getContext("2d") !;
		this.tiles = new Int8Array(width * height);
		this.width = width;
		this.height = height;
		this.canvas.style.display = "none";
		document.body.appendChild(this.canvas);
		this.clear();
		this.internalDraw();
	}
	/// Fill the rectangle `r` with the color `c`
	fill(r: Rectangle, c: number): void {
		c = c % 2;
		for (var x = r.x; x < r.x + r.width; x++)
			for (var y = r.y; y < r.y + r.height; y++)
				this.tiles[this.index(x, y)] = c;
	}
	clear(): void {
		this.tiles.fill(1);
		this.fill({x: 1, y: 1, width: this.width - 2, height: this.height - 2}, 0);
	}
	private index(x: number, y: number): number {
		return x + y * this.width;
	}
	private tileAt(x: number, y: number): number {
		return this.tiles[this.index(x, y)];
	}
	isValidPosition(x: number, y: number): boolean {
		return x >= 0 && y >= 0 && x < this.width && y < this.height && this.tileAt(x, y) == 0;
	}
	/// Draw to the grid's internal buffer
	internalDraw(): void {
		this.context.strokeStyle = "0.5px black";
		for (var y = 0; y < this.height; y++) {
			for (var x = 0; x < this.width; x++) {
				this.context.fillStyle = this.tileAt(x, y) != 0 ? Grid.FILLED : Grid.EMPTY;
				this.context.fillRect(x * Game.TILE_SIZE, y * Game.TILE_SIZE, Game.TILE_SIZE, Game.TILE_SIZE);
			}
			this.context.beginPath();
			this.context.moveTo(0, y * Game.TILE_SIZE);
			this.context.lineTo(this.width * Game.TILE_SIZE, y * Game.TILE_SIZE);
			this.context.stroke();
		}
		for (var x = 0; x < this.width; x++) {
			this.context.beginPath();
			this.context.moveTo(x * Game.TILE_SIZE, 0);
			this.context.lineTo(x * Game.TILE_SIZE, this.height * Game.TILE_SIZE);
			this.context.stroke();
		}
	}
	render(c: CanvasRenderingContext2D): void {
		c.drawImage(this.canvas, 0, 0);
	}
}
