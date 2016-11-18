import Generator from "./Generator";
import Grid from "./Grid";
import Player from "./Player"; 

export default class Game {
	public static readonly TILE_SIZE = 8;
	private readonly grid: Grid = new Grid(64, 64);
	private readonly gen: Generator = new Generator();
	public readonly canvas: HTMLCanvasElement = document.getElementById('game') as HTMLCanvasElement;
	private readonly context: CanvasRenderingContext2D = this.canvas.getContext("2d");
	public readonly players: Player[] = [new Player(this)];
	constructor() {
		this.canvas.width = this.grid.width * Game.TILE_SIZE;
		this.canvas.height = this.grid.height * Game.TILE_SIZE;
		this.canvas.tabIndex = 1;
	}
	public init() {
		this.gen.reset();
		this.gen.generate(this.grid);
		this.grid.internalDraw();
		this.update(1 / 30);
		this.render();
	}
	public render() {
		requestAnimationFrame(this.render.bind(this));
		this.context.fillStyle = "#dcd";
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.grid.render(this.context, 0, 0);
		this.players.forEach((p) => p.draw(this.context));
	}
	public update(dt: number) {
		this.players.forEach((p) => p.update(dt));
		setTimeout(this.update.bind(this, dt), dt);
	}
}