import BasePoint from "./BasePoint";
import Point from "./Point";
import Rectangle from "./Rectangle";
import HashMap from "../ds/HashMap";
import HashSet from "../ds/HashSet";
import Heap from "../ds/Heap";
import Tile from "../Tile";

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
        return this.isValid(x, y) && this.tileAt(x, y) != Tile.Wall;
    }
    /// Returns true when the position {x, y} is in the grid and not empty
    isNotEmpty(x: number, y: number): boolean {
        return this.isValid(x, y) && this.tileAt(x, y) !== Tile.Empty;
    }
    /// Find the shortest path from `start` to `goal` with a maximum number of steps `max`, and using the validity function `isValid`.
    /// Based on the A* algorithm as detailed at http://www.briangrinstead.com/blog/astar-search-algorithm-in-javascript
    ///
    /// INVESTIGATE FRINGE SEARCH
    /// returns in order goal -> start
    findPath(_start: BasePoint, goal: BasePoint): BasePoint[] {
        const start = Point.from(_start);
        const fScores = new HashMap<Point, number>();
        const gScores = new HashMap<Point, number>();
        const parents = new HashMap<Point, Point>();
        const closed = new HashSet<Point>();
        const open = new Heap<Point>((p) => fScores.get(p)!);
        const openSet = new HashSet<Point>();
        gScores.set(start, 0);
        fScores.set(start, start.manhattanDistance(goal));
        open.push(start);
        openSet.add(start);
        while(open.size > 0) {
            let current = open.pop()!;
            openSet.delete(current);
            closed.add(current);
            if(current.equals(goal)) {
                const path = [current];
                while(parents.has(current)) {
                    current = parents.get(current)!;
                    path.push(current);
                }
                return path.reverse();
            }
            const g = gScores.get(current)! + 1;
            const neighbours = this.neighbours(current);
            for(const n of neighbours) {
                if(closed.has(n) || !this.canWalk(n.x, n.y))
                    continue;
                if(!openSet.has(n)) {
                    openSet.add(n);
                    open.push(n);
                } else if(g >= gScores.get(n)!)
                    continue;
                parents.set(n, current);
                gScores.set(n, g);
                fScores.set(n, g + n.manhattanDistance(goal));
            }
        }
        return [];
    }
    neighbours(p: Point): Point[] {
        return [
            new Point(p.x - 1, p.y),
            new Point(p.x + 1, p.y),
            new Point(p.x, p.y - 1),
            new Point(p.x, p.y + 1)
        ];
    }
}