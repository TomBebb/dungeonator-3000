import Grid from "./Grid";
import {Rectangle, intersects, random, randomStep} from "./math";

export default class Generator {
	private minRoomSize: number;
	private maxRoomSize: number;
	private roomSizeIncrement: number;
	private numRooms: number;
	private roomSpacing: number;

	public Generator() {
		this.reset();
	}

	public reset() {
		this.minRoomSize = 4;
		this.maxRoomSize = 10;
		this.numRooms = 10;
		this.roomSpacing = 2;
		this.roomSizeIncrement = 3;
	}

	private randomRoom(grid: Grid, rooms: Rectangle[]): Rectangle | null {
		let keepGenerating: boolean = true;
		const r: Rectangle = {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		};
		let attempts: number = 0;
		let randomSize = randomStep.bind(this, this.minRoomSize, this.maxRoomSize, this.roomSizeIncrement);
		do {
			attempts++;
			r.width = randomSize();
			r.height = randomSize();
			r.x = random(0, grid.width - r.width);
			r.y = random(0, grid.height - r.height);
			keepGenerating = false;
			for(var o of rooms)
				if(intersects(r, o, this.roomSpacing)) {
					keepGenerating = true;
					break;
				}
		} while(keepGenerating && attempts < 20);
		return attempts >= 20 ? null : r;
	}
	public generate(grid: Grid) {
		grid.clear();
		const rooms: Rectangle[] = [];
		let room: Rectangle | null;
		if(this.numRooms == undefined)
			throw this;
		while(rooms.length < this.numRooms) {
			room = this.randomRoom(grid, rooms);
			if(room == null)
				break;
			else
				rooms.push(room);
		}
		for(var i = 0; i < rooms.length; i++) {
			let r = rooms[i];
			grid.fill(r, i);
		}
	}
}