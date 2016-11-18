import Camera from "./Camera";
import Generator from "./Generator";
import Grid from "./Grid";
import { GamepadInput } from "./input";
import { Entity } from "./entities";

export default class Game {
	static readonly TILE_SIZE = 32;
	private readonly grid: Grid = new Grid(64, 64);
	private readonly gen: Generator = new Generator();
	readonly canvas: HTMLCanvasElement = document.getElementById('game') ! as HTMLCanvasElement;
	private readonly context: CanvasRenderingContext2D = this.canvas.getContext("2d") !;
	entities: Entity<any>[] = [Entity.defaultPlayer(this)];
	readonly camera: Camera = new Camera(this.entities[0]);
	constructor() {
		this.canvas.tabIndex = 1;

		window.addEventListener("ongamepadconnected", function(this: Game, ge: GamepadEvent) {
			this.entities.push(new Entity(this, new GamepadInput(ge.gamepad)));
		}.bind(this));
		window.addEventListener("ongamepaddisconnected", function(this: Game, ge: GamepadEvent) {
			this.entities.forEach((e: Entity<any>, i: number) => {
				if (e.input instanceof Gamepad && e.input.index == ge.gamepad.index)
					this.entities.splice(i);
			});
		});
		this.reset();
		this.update(1 / 30);
		this.render();
	}
	canMoveTo(x: number, y: number): boolean {
		return this.grid.canMoveTo(x, y);
	}
	reset() {
		this.gen.reset();
		this.gen.generate(this.grid);
		this.grid.internalDraw();
	}
	render() {
		requestAnimationFrame(this.render.bind(this));
		this.context.save();
		this.context.fillStyle = "#dcd";
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.camera.apply(this.context);
		this.grid.render(this.context, 0, 0);
		this.entities.forEach((p) => p.draw(this.context));
		this.context.restore();
	}
	update(dt: number) {
		this.entities.forEach((p) => p.update(dt));
		setTimeout(this.update.bind(this, dt), dt);
	}
}