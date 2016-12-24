import Grid from "./Grid";
import {Size, Rectangle, random, intersects} from "./math";

export default class Generator {
	private static readonly MIN_ROOM_SIZE: number = 4;
	private static readonly MAX_ROOM_SIZE: number = 10;
	private static readonly NUM_ROOMS: number = 4;
	private static readonly ROOM_SPACING: number = 2;

	public grid: Grid;
	private rooms: Rectangle[] = [];
	public Generator(grid: Grid) {
		this.grid = grid;
	}
	/// Generate a random room size and set it on the `Size`
	private generateRoomSize(size: Size) {
		const roomSize = random.bind(null, Generator.MIN_ROOM_SIZE, Generator.MAX_ROOM_SIZE);
		size.width = roomSize();
		size.height = roomSize();
	}
	private placeOnGrid(rect: Rectangle, numAttempts: number = 5): boolean {
		do {
			rect.x = random(1, this.grid.width - 1 - rect.width);
			rect.y = random(1, this.grid.height - 1 - rect.height);
		} while(this.rooms.find((r: Rectangle) => intersects(r, rect, Generator.ROOM_SPACING)) != undefined && --numAttempts > 0);
		return numAttempts > 0;
	}
	public generate() {
		let numAttempts: number = 0;
		while(this.rooms.length < Generator.NUM_ROOMS && numAttempts < 5) {
			let current: Rectangle = {x: 0, y: 0, width: 0, height: 0};
			this.generateRoomSize(current);
			numAttempts += 1;
			if(this.placeOnGrid(current)) {
				this.rooms.push(current);
				this.grid.line(current, 1);
				this.grid.setTileAt(current.x + Math.floor(current.width / 2), current.y, 0);
				this.grid.setTileAt(current.x + Math.floor(current.width / 2), current.y + current.height, 0);
				numAttempts = 0;
			}
		}
	}
}
