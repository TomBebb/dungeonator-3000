import Grid from "./Grid";
import Tile from "./Tile";
import {Size, Rectangle, Point, random, randomIn, intersects} from "./math";

export default class Generator {
	private static readonly EDGE_DISTANCE: number = 2;
	private static readonly MIN_ROOM_SIZE: number = 8;
	private static readonly MAX_ROOM_SIZE: number = 18;
	private static readonly NUM_ROOMS: number = 6;
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
			rect.x = random(Generator.EDGE_DISTANCE, this.grid.width - rect.width - Generator.EDGE_DISTANCE * 2);
			rect.y = random(Generator.EDGE_DISTANCE, this.grid.height - rect.height - Generator.EDGE_DISTANCE * 2);
		} while(this.rooms.find((r: Rectangle) => intersects(r, rect, Generator.ROOM_SPACING)) != undefined && --numAttempts > 0);
		return numAttempts > 0;
	}
	public generate() {
		let numAttempts: number = 0;
		this.grid.clear(Tile.Wall);
		while(this.rooms.length < Generator.NUM_ROOMS && numAttempts++ < 10) {
			const room: Rectangle = {x: 0, y: 0, width: 0, height: 0};
			this.generateRoomSize(room);
			if(this.placeOnGrid(room)) {
				this.grid.fill(room, Tile.Empty);
				this.grid.outline(room, Tile.Wall);
				numAttempts = 0;
				this.rooms.push(room);
			}
		}
		for(let i = 0; i < this.rooms.length; i++) {
			const room = this.rooms[i];
			const middle = Generator.middle(room);
			const last = Generator.middle(this.rooms[(i + 1) % this.rooms.length]);
			if(Math.random() > 0.5) {
				this.grid.hline(last.x, room.x, last.y, Tile.Empty);
				this.grid.vline(room.x, last.y, room.y, Tile.Empty);
			} else {
				this.grid.vline(last.x, last.y, room.y, Tile.Empty);
				this.grid.hline(last.x, room.x, room.y, Tile.Empty);
			}
		}
	}
	private static middle(r: Rectangle) : Point {
		return {
			x: r.x + Math.floor(r.width / 2),
			y: r.y + Math.floor(r.height / 2)
		};
	}
}
