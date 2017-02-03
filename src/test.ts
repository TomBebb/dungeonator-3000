import Bits from "./util/Bits";
import Heap from "./util/Heap";
import { Point } from "./util/math";
import HashMap from "./util/HashMap";
import HashSet from "./util/HashSet";
import Grid from "./util/Grid";
import Tile from "./util/Tile";

function gridTest() {
	const grid = new Grid(16, 16);
	grid.clear(Tile.Empty);
	console.assert(grid.isEmpty(8, 8));
	grid.hline(1, 15, 8, Tile.Wall);
	console.assert(grid.tileAt(8, 8) == Tile.Wall);
	console.assert(grid.tileAt(0, 8) == Tile.Empty);
	const start = {x: 8, y: 0};
	const goal = {x: 8, y: 15};
	const path = grid.findPath(start, goal);
	for(let y = 0; y < grid.height; y++) {
		let t = "";
		for(let x = 0; x < grid.width; x++) {
			let tile;
			if(path.find((p) => p.x == x && p.y == y))
				tile = " ";
			else if(grid.tileAt(x, y) == Tile.Empty)
				tile = "░";
			else
				tile = "█";
			t += tile;
		}
		console.log(t);
	}

	console.assert(path[0].distSquared(start) == 0);
	console.assert(path[path.length - 1].distSquared(goal) == 0);
	let lastDir;
	for(let i = 1; i < path.length; i++) {
		const [dx, dy] = [path[i].x - path[i - 1].x, path[i].y - path[i - 1].y];
		let cdir;
		if(Math.abs(dx) > Math.abs(dy))
			cdir = dx > 0 ? "Right" : "Left";
		else
			cdir = dy > 0 ? "Down" : "Up";
		if(cdir != lastDir)
			console.log(cdir);
		lastDir = cdir;
	}
}

function heapTest() {
    const heap = new Heap((x: {score: number}) => x.score);
    console.assert(heap.size == 0);
    heap.queue({ score: 10 });
    const twenty = { score: 20 };
    heap.queue(twenty);
    heap.queue({ score: 5 });
    console.assert(heap.size == 3);
    console.assert(heap.dequeue()!.score == 5);
    twenty.score = 5;
    heap.rescore(twenty);
    console.assert(heap.dequeue()!.score == 5);
    console.assert(heap.dequeue()!.score == 10);
    console.assert(heap.size == 0);
    heap.queue({ score: 4 });
    heap.clear();
    console.assert(heap.size == 0);
}

function bitsTest() {
	const bits = new Bits(32);
	console.assert(bits.length == 0);
	console.assert(bits.first(true) == -1);
	console.assert(!bits.get(0));
	bits.set(3);
	console.assert(bits.length == 4);
	console.assert(bits.get(3));
	console.assert(bits.first(true) == 3);
	bits.setAll();
	console.assert(bits.first(false) == -1);
	bits.clear();
	console.assert(bits.length == 0);
}

function pointTest() {
	const point = new Point(3, 3);
	console.assert(point.equals(point));
	console.assert(!point.equals({x: 2, y: 3}));
	console.assert(point.distSquared(point) == 0);
	console.assert(point.distSquared({x: 2, y: 3}) == 1);
}

function hashTest() {
	const p = new Point(3, 3);
	const p2 = new Point(3, 2);
	const set = new HashSet<Point>();
	const map = new HashMap<Point, number>();
	console.assert(!set.has(p));
	console.assert(!set.has(p2));
	console.assert(!map.has(p));
	console.assert(!map.has(p2));
	set.add(p);
	set.add(p2);
	map.set(p, 3);
	console.assert(!map.has(p2));
	console.assert(set.has(p));
	console.assert(set.has(p2));
	console.assert(map.get(p) == 3);
	set.delete(p);
	map.delete(p);
	console.assert(!set.has(p));
	console.assert(!map.has(p));
	console.assert(set.has(p2));
}

export default function test() {
	gridTest();
	hashTest();
	pointTest();
	bitsTest();
	heapTest();
}