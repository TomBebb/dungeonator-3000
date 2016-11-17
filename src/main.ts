function rand(min:number, max:number):number {
	return Math.floor(min + Math.random() * (max - min));
}
function round(num:number, inc:number):number {
	return Math.round(num / inc) * inc;
}
function randInc(min:number, max:number, inc:number):number {
	return min + round(rand(min, max) - min, inc);
}
class Rectangle {
	public x: number;
	public y: number;
	public width: number;
	public height: number;
	constructor(x: number, y: number, w: number, h: number) {
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
	}

	public intersects(r: Rectangle, spacing: number): boolean {
		return Math.abs((this.x + this.width / 2) - (r.x + r.width / 2)) < (this.width + r.width) / 2 + spacing
		&& Math.abs((this.y + this.height / 2) - (r.y + r.height / 2)) < (this.height + r.height) / 2 + spacing;
	}
}

interface Generation {
	minRoomSize: number;
	maxRoomSize: number;
	roomSizeIncrement: number;
	numRooms: number;
	roomSpacing: number;
}

class Grid {
	protected readonly buffer: Int8Array;
	protected static readonly colors: string[] = [
		"white",
		"red",
		"green",
		"blue",
		"yellow",
		"orange",
		"purple",
		"gray",
		"black"
	];
	public readonly width: number;
	public readonly height: number;
	public readonly tileSize: number;
	public readonly generation: Generation;
	constructor(width: number, height: number, tileSize: number, gen: Generation) {
		this.buffer = new Int8Array(width * height);
		this.width = width;
		this.height = height;
		this.tileSize = tileSize;
		this.generation = gen;
		this.generate();
	}
	private fill(r: Rectangle, c: number) {
		c = c % Grid.colors.length;
		for(var x = r.x; x < r.x + r.width; x++)
			for(var y = r.y; y < r.y + r.height; y++) {
				this.buffer[this.index(x, y)] = c;
			}
	}
	private randomRoom(rooms: Rectangle[]): Rectangle | null {
		var keepGenerating: boolean = true;
		var r: Rectangle = new Rectangle(0, 0, 0, 0);
		var attempts: number = 0;
		var g: Generation = this.generation;
		do {
			attempts++;
			r.width = randInc(g.minRoomSize, g.maxRoomSize, g.roomSizeIncrement);
			r.height = randInc(g.minRoomSize, g.maxRoomSize, g.roomSizeIncrement);
			r.x = rand(0, this.width - r.width);
			r.y = rand(0, this.height - r.height);
			keepGenerating = false;
			for(var o of rooms)
				if(r.intersects(o, g.roomSpacing)) {
					keepGenerating = true;
					break;
				}
		} while(keepGenerating && attempts < 20);
		return attempts >= 20 ? null : r;
	}
	public generate() {
		this.clear();
		var rooms: Rectangle[] = [];
		var room: Rectangle | null;
		while(rooms.length < this.generation.numRooms) {
			room = this.randomRoom(rooms);
			if(room == null)
				break;
			else
				rooms.push(room);
		}
		for(var i = 0; i < rooms.length; i++)
			this.fill(rooms[i], i);
	}
	public clear() {
		this.buffer.fill(0);
	}
	protected index(x: number, y: number) {
		return x + y * this.width;
	}
	public render(c: CanvasRenderingContext2D) {
		c.clearRect(0, 0, this.width, this.height);
		for(var x = 0; x < this.width; x++)
			for(var y = 0; y < this.height; y++) {
				c.fillStyle = Grid.colors[this.buffer[this.index(x, y)]];
				c.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
			}
	}
}

interface Node {
	x: number;
	y: number;
	colored: boolean;
	parent: Node | null;
}

function bfs(start: Node, goal: Node) {
	var queue: Node[] = [start];
	while queue.length > 0 {
		var item = queue.pop();
		item.colored = true;
		
	}
}

class Game {
	private readonly grid: Grid = new Grid(64, 64, 8, {
		minRoomSize: 4,
		maxRoomSize: 20,
		roomSizeIncrement: 4,
		numRooms: 10,
		roomSpacing: 2
	});
	private readonly canvas: HTMLCanvasElement = document.getElementById('game') as HTMLCanvasElement;
	private readonly context: CanvasRenderingContext2D = this.canvas.getContext("2d");
	constructor() {
		this.canvas.width = this.grid.width * this.grid.tileSize;
		this.canvas.height = this.grid.height * this.grid.tileSize;
		this.canvas.tabIndex = 1;
		this.canvas.onkeydown = function(e) {
			this.grid.generate();
		}.bind(this);
	}
	public render() {
		this.grid.render(this.context);
	}
	public update(dt: number) {
		requestAnimationFrame(this.update.bind(this));
		this.render();
	}
}
let game = new Game();
game.update(0);