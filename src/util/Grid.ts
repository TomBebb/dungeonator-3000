import { Rectangle, Point, BasePoint } from "../util/math"
import HashMap from "../util/HashMap";
import Heap from "./Heap";
import Tile from "./Tile";

/// A 2D Grid
export default class Grid {
    /// The width of the grid in tiles.
    readonly width: number;
    /// The height of the grid in tiles.
    readonly height: number;

    readonly tiles: Int8Array;

    rooms: Rectangle[] = [];

    tracePaths: boolean = true;

    readonly nodes: Point[] = [];
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.tiles = new Int8Array(width * height);
        this.clear();
    }
    /// Fill the rectangle `r` with the tile `c`
    fill(r: Rectangle, t: Tile): void {
        for (let x = r.x; x < r.x + r.width; x++)
            for (let y = r.y; y < r.y + r.height; y++)
                this.tiles[this.index(x, y)] = t;
    }
    /// Draw lines for each edge of `r`, with `t`.
    outline(r: Rectangle, t: Tile): void {
        for (let x = r.x; x <= r.x + r.width; x++) {
            this.tiles[this.index(x, r.y)] = t;
            this.tiles[this.index(x, r.y + r.height)] = t;
        }
        for (let y = r.y; y <= r.y + r.height; y++) {
            this.tiles[this.index(r.x, y)] = t;
            this.tiles[this.index(r.x + r.width, y)] = t;
        }
    }
    /// Draw a horizontal line between (x1, y) and (x2, y)
    hline(x1: number, x2: number, y: number, t: Tile): void {
        for(let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++)
            this.setTileAt(x, y, t);
    }
    vline(x: number, y1: number, y2: number, t: Tile): void {
        for(let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++)
            this.setTileAt(x, y, t);
    }
    clear(t: Tile = Tile.Empty): void {
        this.tiles.fill(t);
    }
    private index(x: number, y: number): number {
        return x + y * this.width;
    }
    tileAt(x: number, y: number): Tile {
        return this.tiles[this.index(x, y)];
    }
    setTileAt(x: number, y: number, t: Tile) {
        this.tiles[this.index(x, y)] = t;
    }
    /// Returns true when the position `p` is in the grid
    isValid(x: number, y: number): boolean {
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
    }
    /// Returns true when the position {x, y} is in the grid and empty
    isEmpty(x: number, y: number): boolean {
        return this.isValid(x, y) && this.tileAt(x, y) === Tile.Empty;
    }
    /// Returns true when the position {x, y} is in the grid and empty
    canWalk(x: number, y: number): boolean {
        const can = this.isValid(x, y) && this.tileAt(x, y) != Tile.Wall;
        if(this.tracePaths)
            console.log(`${x}, ${y}, ${can} => ${this.tileAt(x, y)} = ${this.tileAt(x, y) == Tile.Wall ? 'wall' : 'empty'}`);
        return can;
    }
    /// Returns true when the position {x, y} is in the grid and not empty
    isNotEmpty(x: number, y: number): boolean {
        return this.isValid(x, y) && this.tileAt(x, y) !== Tile.Empty;
    }
    /// Find the shortest path from `start` to `goal` with a maximum number of steps `max`, and using the validity function `isValid`.
    /// Based on the A* algorithm as detailed at http://www.briangrinstead.com/blog/astar-search-algorithm-in-javascript
    findPath(_start: BasePoint, _goal: BasePoint): Point[] {
        const start = Point.from(_start);
        const goal = Point.from(_goal);
        const frontier = new Heap<Point>();
        const cameFrom = new HashMap<Point, Point>();
        const cost = new HashMap<Point, number>();
        frontier.push(start, 0);
        cost.set(start, 0);
        while(frontier.size > 0) {
            const current = frontier.pop()!;
            if(current.equals(goal))
                return this.makePath(current, cameFrom);
            for(const next of this.neighbours(current)) {
                const newCost = cost.get(current)! + 1;
                if(!cost.has(next) || newCost < cost.get(next)!) {
                    if(this.tracePaths) 
                        console.log(cost.get(current)!, current, next);
                    cost.set(next, newCost);
                    frontier.push(next, newCost + goal.manhattanDistance(next));
                    cameFrom.set(next, current);
                }
            }
        }
        return [];
    }
    /// Consturct a path from the current node
    makePath(current: Point, cameFrom: HashMap<Point, Point>): Point[] {
        const path = [current];
        while(cameFrom.has(current)) {
            current = cameFrom.get(current)!;
            path.push(current);
        }
        return path.reverse();
    }
    neighbours(p: Point): Point[] {
        const ns = [];
        if(this.canWalk(p.x - 1, p.y))
            ns.push(new Point(p.x - 1, p.y))
        if(this.canWalk(p.x + 1, p.y))
            ns.push(new Point(p.x + 1, p.y))
        if(this.canWalk(p.x, p.y - 1))
            ns.push(new Point(p.x, p.y - 1))
        if(this.canWalk(p.x, p.y + 1))
            ns.push(new Point(p.x, p.y + 1))
        return ns;
    }
}