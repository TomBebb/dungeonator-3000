import Grid from "./Grid";
import Tile from "./Tile";
import {Size, Rectangle, Point, random, intersects} from "./math";

/// This is responsible for generating dungeons on a `Grid`.
export default class Generator {
	/// The minimum number of tiles between a room's walls and the grid's edge
	private static readonly EDGE_DISTANCE: number = 1;
	/// The minimum room width / height
	private static readonly MIN_ROOM_SIZE: number = 8;
	/// The minimum room width / height
	private static readonly MAX_ROOM_SIZE: number = 14;
	/// The maximum number of rooms to generate in a dungeon 
	private static readonly NUM_ROOMS: number = 5;
	/// The minimum number of tiles between one room's walls and another room's walls.
	private static readonly ROOM_SPACING: number = 1;
	/// The number of connections between rooms
	private static readonly MIN_ROOM_CONNECTIONS: number = 1;
	/// The number of connections between rooms
	private static readonly MAX_ROOM_CONNECTIONS: number = 2;

	/// The grid to generate rooms on.
	grid: Grid;
	private rooms: Rectangle[] = [];
	public Generator(grid: Grid) {
		this.grid = grid;
	}
	/// Generate a random room size and set it on the `Size`
	///
	/// A cool thing about TypeScript is it has structural interfaces, so any Size must have `width` and `height` fields.
	/// If this was in Java this would be the same as defining `getWidth` and `getHeight` methods in `Size` and using them here.
	private generateRoomSize(size: Size) {
		const roomSize = random.bind(null, Generator.MIN_ROOM_SIZE, Generator.MAX_ROOM_SIZE);
		size.width = roomSize();
		size.height = roomSize();
	}
	/// Attempt to place the rectangle `rect` on the grid a maximum of `numAttempts` times.
	///
	/// This returns true if the rectangle could be placed i.e. it doesn't overlap with any other rectangles.
	private placeOnGrid(rect: Rectangle, numAttempts: number = 5): boolean {
		do {
			rect.x = random(Generator.EDGE_DISTANCE, this.grid.width - rect.width - Generator.EDGE_DISTANCE * 2);
			rect.y = random(Generator.EDGE_DISTANCE, this.grid.height - rect.height - Generator.EDGE_DISTANCE * 2);
		} while(this.rooms.find((r: Rectangle) => intersects(r, rect, Generator.ROOM_SPACING)) != undefined && --numAttempts > 0);
		return numAttempts > 0;
	}
	/// Generate a dungeon floor on the grid, attempting to generate a room a maximum of `numAttempts` times before giving up.
	public generate(numAttempts: number = 5) {
		/// Clear the grid to walls
		this.grid.clear(Tile.Wall);
		let _num = numAttempts;
		while(this.rooms.length < Generator.NUM_ROOMS && --_num > 0) {
			/// Make a rectangle with default values.
			const room: Rectangle = {x: 0, y: 0, width: 0, height: 0};
			/// Generate a room size for the `room`
			this.generateRoomSize(room);
			/// If the room could be placed in the dungeon, i.e. its position could be set randomly.
			if(this.placeOnGrid(room)) {
				/// Set all the tiles inside `room` to empty ones.
				this.grid.fill(room, Tile.Empty);
				/// Set all the tiles along `room`'s walls to wall tiles.
				this.grid.outline(room, Tile.Wall);
				_num = numAttempts;
				/// Add the room to the `rooms` array.
				this.rooms.push(room);
			}
		}
		/// For each room in the dungeon
		for(let i = 0; i < this.rooms.length; i++) {
			const connections = random(Generator.MIN_ROOM_CONNECTIONS, Generator.MAX_ROOM_CONNECTIONS);
			/// Connect this room and the other rooms.
			for(let j = 0; j < connections; j++)
				this.connect(this.rooms[i], this.rooms[(i + j) % this.rooms.length]);
		}
		/// Synchronise the new rooms with the grid's.
		this.grid.rooms = this.rooms;
	}
	/// Connect the rooms `a` and `b` with a corridor.
	private connect(a: Rectangle, b: Rectangle) {
		const aMid = Generator.middle(a);
		const bMid = Generator.middle(b);
		if(Math.random() > 0.5) {
			this.grid.hline(bMid.x, aMid.x, bMid.y, Tile.Empty);
			this.grid.vline(aMid.x, bMid.y, aMid.y, Tile.Empty);
		} else {
			this.grid.vline(bMid.x, bMid.y, aMid.y, Tile.Empty);
			this.grid.hline(bMid.x, aMid.x, aMid.y, Tile.Empty);
		}
	}
	/// Return the centre tile of the rectangle `r`.
	private static middle(r: Rectangle) : Point {
		return {
			x: r.x + Math.floor(r.width / 2),
			y: r.y + Math.floor(r.height / 2)
		};
	}
}
