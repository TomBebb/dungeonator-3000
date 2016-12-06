import Grid from "./Grid";
import {Size, Rectangle, random, intersects} from "./math";

export default class Generator {
	private static readonly MIN_ROOM_SIZE: number = 4;
	private static readonly MAX_ROOM_SIZE: number = 10;
	private static readonly NUM_ROOMS: number = 4;
	//private static readonly NUM_ROOMS: number = 10;

	public grid: Grid;
	private rooms: Rectangle[] = [];
	public Generator(grid: Grid) {
		this.grid = grid;
	}
	private generateRoomSize(size: Size) {
		const roomSize = random.bind(null, Generator.MIN_ROOM_SIZE, Generator.MAX_ROOM_SIZE);
		size.width = roomSize();
		size.height = roomSize();
	}
	private placeOnGrid(rect: Rectangle, numAttempts: number = 5): boolean {
		do {
			rect.x = random(1, this.grid.width - 1 - rect.width);
			rect.y = random(1, this.grid.height - 1 - rect.height);
		} while(this.rooms.find((r: Rectangle) => intersects(r, rect, 1)) == null && numAttempts-- > 0);
		return numAttempts > 0;
	}
	public generate() {
		while(this.rooms.length < Generator.NUM_ROOMS) {
			let current: Rectangle = {x: 0, y: 0, width: 0, height: 0};
			this.generateRoomSize(current);
			if(this.placeOnGrid(current)) {
				this.rooms.push(current);
				this.grid.fill(current, 1);
			}
		}
		this.grid.internalDraw();
	}
}
