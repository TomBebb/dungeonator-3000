import Grid from "./Grid";
import {Rectangle, random} from "./math";

export default class Generator {
	private static readonly MIN_ROOM_SIZE: number = 4;
	private static readonly MAX_ROOM_SIZE: number = 10;
	//private static readonly NUM_ROOMS: number = 10;

	public grid: Grid;
	private rooms: Rectangle[] = [];
	public Generator(grid: Grid) {
		this.grid = grid;
	}
	public generate() {
		const roomSize = random.bind(null, Generator.MIN_ROOM_SIZE, Generator.MAX_ROOM_SIZE);
		let [w, h] = [roomSize(), roomSize()];
		let current: Rectangle = {
			x: (this.grid.width - w) / 2,
			y: (this.grid.height - h) / 2,
			width: w,
			height: h
		};
		console.log(current);
		this.rooms.push(current);
		for(var i = 0; i < this.rooms.length; i++) {
			this.grid.fill(this.rooms[i], i + 1);
		}
		this.grid.internalDraw();
	}
}
