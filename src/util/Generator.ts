import Grid from "./Grid";
import Tile from "./Tile";
import {Rectangle, random} from "./math";

/// This is responsible for generating dungeons on a `Grid`.
export default class Generator {
	/// The minimum number of tiles between a room's walls and the grid's edge
	private static readonly EDGE_DISTANCE: number = 1;
	/// The minimum room width / height
	private static readonly MIN_ROOM_SIZE: number = 10;
	/// The minimum room width / height
	private static readonly MAX_ROOM_SIZE: number = 20;
	/// The maximum number of rooms to generate in a dungeon 
	private static readonly NUM_ROOMS: number = 10;
	/// The minimum number of tiles between one room's walls and another room's walls.
	private static readonly ROOM_SPACING: number = 1;
	/// The number of connections between rooms
	private static readonly MIN_ROOM_CORRIDORS: number = 1;
	/// The number of connections between rooms
	private static readonly MAX_ROOM_CORRIDORS: number = 3;

	/// The grid to generate rooms on.
	grid: Grid;
	/// The array of rooms, which is needed post-gen for fast spawning.
	private rooms: Rectangle[] = [];

	/// Create a generator on `grid`
	public Generator(grid: Grid) {
		this.grid = grid;
	}
	/// Attempt to place the room `room` on the grid a maximum of `numAttempts` times.
	///
	/// This returns true if the room could be placed i.e. it doesn't overlap with any other rectangles.
	private placeOnGrid(room: Rectangle, numAttempts: number = 5): boolean {
		do {
			/// Generate a random position that should be valid.
			room.x = random(Generator.EDGE_DISTANCE, this.grid.width - room.width - Generator.EDGE_DISTANCE * 2);
			room.y = random(Generator.EDGE_DISTANCE, this.grid.height - room.height - Generator.EDGE_DISTANCE * 2);
			/// Repeat the above if there is a room with `room`.
		} while(this.rooms.find((r: Rectangle) => r.intersects(room, Generator.ROOM_SPACING)) != undefined && --numAttempts > 0);
		return numAttempts > 0;
	}
	/// Generate a dungeon floor on the grid, attempting to generate a room a maximum of `numAttempts` times before giving up.
	public generate(numAttempts: number = 5) {
		// Clear the grid to walls
		this.grid.clear(Tile.Wall);
		let _num = numAttempts;
		while(this.rooms.length < Generator.NUM_ROOMS && --_num > 0) {
			// Generate a room size for the `room`
			const roomSize = random.bind(null, Generator.MIN_ROOM_SIZE, Generator.MAX_ROOM_SIZE);
			// Make a rectangle with default values.
			const room: Rectangle = new Rectangle(0, 0, roomSize(), roomSize());
			// If the room could be placed in the dungeon, i.e. its position could be set randomly.
			if(this.placeOnGrid(room)) {
				// Set all the tiles inside `room` to empty ones.
				this.grid.fill(room, Tile.Empty);
				// Set all the tiles along `room`'s walls to wall tiles.
				this.grid.outline(room, Tile.Wall);
				_num = numAttempts;
				// Add the room to the `rooms` array.
				this.rooms.push(room);
			}
		}
		// For each room in the dungeon
		for(let i = 0; i < this.rooms.length; i++) {
			// The number of corridors to have between rooms.
			const corridors = random(Generator.MIN_ROOM_CORRIDORS, Generator.MAX_ROOM_CORRIDORS);
			// Connect this room and the other rooms.
			for(let j = 1; j <= corridors; j++)
				this.connect(this.rooms[i], this.rooms[(i + j) % this.rooms.length]);
		}
		// Synchronise the new rooms with the grid's.
		this.grid.rooms = this.rooms;
	}
	/// Connect the rooms `a` and `b` with a corridor.
	private connect(a: Rectangle, b: Rectangle) {
		// Find the centre of a
		const aMid = a.centre;
		// Find the centre of b
		const bMid = b.centre;
		// Make a corridor connecting `aMid` and `bMid`
		if(Math.random() > 0.5) {
			this.grid.hline(bMid.x, aMid.x, bMid.y, Tile.Empty);
			this.grid.vline(aMid.x, bMid.y, aMid.y, Tile.Empty);
		} else {
			this.grid.vline(bMid.x, bMid.y, aMid.y, Tile.Empty);
			this.grid.hline(bMid.x, aMid.x, aMid.y, Tile.Empty);
		}
	}
}
