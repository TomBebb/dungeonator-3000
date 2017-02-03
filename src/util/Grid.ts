import { Rectangle, Point, BasePoint } from "../util/math"
import HashMap from "../util/HashMap";
import HashSet from "../util/HashSet";
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
    /// Returns true when the position {x, y} is in the grid and not empty
    isNotEmpty(x: number, y: number): boolean {
        return this.isValid(x, y) && this.tileAt(x, y) !== Tile.Empty;
    }    /// Find the shortest path from `start` to `goal` with a maximum number of steps `max`, and using the validity function `isValid`.
    /// Based on the A* algorithm as detailed at https://en.wikipedia.org/wiki/A*_search_algorithm#Pseudocode
    findPath(s: BasePoint, g: BasePoint): Point[] {
        // Make point objects from the structural interface points
        const start = new Point(s.x, s.y);
        const goal = new Point(g.x, g.y);
        // Make a set to store point hashes that have been checked
        const closed = new HashSet<Point>();
        // Make a place to store f scores
        const fScore = new HashMap<Point, number>();
        // Store the purely heuristic part of the goal
        fScore.set(start, start.manhattanDistance(goal));
        // Make a set to store point hashes that need processing as well as a priority queue of them.
        const open = new Heap<Point>((p) => fScore.get(p)!);
        const openSet = new HashSet<Point>();
        // Add the start point to this
        open.queue(start);
        openSet.add(start);
        // Associate points to their previous points.
        const cameFrom = new HashMap<Point, Point>();
        const gScore = new HashMap<Point, number>();
        gScore.set(start, 0);
        // While there are still points in the open set
        while(open.size > 0) {
            // Remove the point with the lowest f score.
            const current = open.dequeue()!;
            openSet.delete(current);
            // Add to the closed set
            closed.add(current);
            // If this is the goal point
            if(current.equals(goal)) {
                // Return the path from this to the goal point
                let curr = current;
                const path = [curr];
                while(cameFrom.has(curr)) {
                    curr = cameFrom.get(curr)!;
                    path.push(curr);
                };
                return path.reverse();
            }
            // Compute the value of g for each of its neighbours
            const g = gScore.get(current) + 1;
            // For every neighbouring point
            for(let n of Grid.neighbours(current)) {
                // Skip it if it has already been processed or is invalid
                if(closed.has(n) || !this.isEmpty(n.x, n.y))
                    continue;
                if(!openSet.has(n)) {
                    // A new node has been found!
                    // Add to the open set and heap
                    open.queue(n);
                    openSet.add(n);
                } else if(g >= gScore.get(n)!)
                    continue;
                cameFrom.set(n, current);
                gScore.set(n, g);
                fScore.set(n, g + n.manhattanDistance(goal));
                open.rescore(n);
            }
        }
        return [];
    }
    /// Fill an array of 4 nodes with each neighbour of the node.
    private static neighbours(p: Point): Point[] {
        return [
            new Point(p.x + 1, p.y),
            new Point(p.x - 1, p.y),
            new Point(p.x, p.y + 1),
            new Point(p.x, p.y - 1)
        ];
    }
}