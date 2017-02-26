import Grid from "./util/geom/Grid";
import { Point } from "./util/geom/Point";
import Bits from "./util/ds/Bits";
import Heap from "./util/ds/Heap";
import HashMap from "./util/ds/HashMap";
import HashSet from "./util/ds/HashSet";
import Tile from "./util/Tile";

function gridTest() {
    const grid = new Grid(16, 16);
    grid.clear(Tile.Empty);
    console.assert(grid.isEmpty(8, 8));
    grid.hline(1, 15, 8, Tile.Wall);
    console.assert(grid.tileAt(8, 8) == Tile.Wall);
    console.assert(!grid.canWalk(-8, 0));
    console.assert(!grid.canWalk(0, -2));
    console.assert(!grid.canWalk(8, 8));
    console.assert(grid.canWalk(0, 8)); 
    console.assert(grid.tileAt(0, 8) == Tile.Empty);
    const start = {x: 8, y: 0};
    const goal = {x: 8, y: 15};
    const path = grid.findPath(start, goal);
    console.assert(path.length > 0);
    console.log(path.findIndex((p) => goal.x == p.x && goal.y == p.y), path.length);
    console.assert(Point.from(goal).distSquared(path[path.length - 1]) == 0);
    for(let i = 1; i < path.length; i++)
        console.assert(Math.abs(path[i].x - path[i - 1].x) <= 1 && Math.abs(path[i].y - path[i - 1].y) <= 1)
    console.assert(Point.from(start).distSquared(path[0]) <= 1);
}

function heapTest() {
    const heap = new Heap<number>((v) => v);
    console.assert(heap.size == 0);
    const count = 10;
    for(let n = 0; n < count; n++) {
        console.assert(heap.size == n);
        heap.push(n);
    }
    for(let n = 0; n < count; n++) {
        const p = heap.pop()!;
        console.assert(p == n);
    }
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
    const map = new HashMap<Point, number>(0);
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
    console.assert(map.get(p) == 0);
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