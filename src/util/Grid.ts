import { Rectangle, Point, pointEq } from "../util/math"
import { manhattan } from "../path/heuristic"; 
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
        for(const tmp = {x: Math.min(x1, x2), y}; tmp.x <= Math.max(x1, x2); tmp.x++)
            this.setTileAt(tmp, t);
    }
    vline(x: number, y1: number, y2: number, t: Tile): void {
        for(const tmp = {x, y: Math.min(y1, y2)}; tmp.y <= Math.max(y1, y2); tmp.y++)
            this.setTileAt(tmp, t);
    }
    clear(t: Tile = Tile.Empty): void {
        this.tiles.fill(t);
    }
    private index(x: number, y: number): number {
        return x + y * this.width;
    }
    tileAt(p: Point): Tile {
        return this.tiles[this.index(p.x, p.y)];
    }
    setTileAt(p: Point, t: Tile) {
        this.tiles[this.index(p.x, p.y)] = t;
    }
    /// Returns true when the position `p` is in the grid
    isValidAt(p: Point): boolean {
        return p.x >= 0 && p.y >= 0 && p.x < this.width && p.y < this.height;
    }
    /// Returns true when the position {x, y} is in the grid and empty
    isEmptyAt(p :Point): boolean {
        return this.isValidAt(p) && this.tileAt(p) == Tile.Empty;
    }
    /// Returns true when the position {x, y} is in the grid and not empty
    isNotEmptyAt(p: Point): boolean {
        return this.isValidAt(p) && this.tileAt(p) != Tile.Empty;
    }
    /// Find the shortest path from `start` to `goal` with a maximum number of steps `max`, and using the validity function `isValid`.
    /// Based on the A* algorithm as detailed at http://web.mit.edu/eranki/www/tutorials/search/.
    findPath(start: Point, goal: Point, isValid: (p: Point) => boolean = (p) => this.isValidAt(p)): Point[] {
        // If one of the start or end points is invalid or the start point is the goal point.
        if(!isValid(start) || !isValid(goal) || pointEq(start, goal))
            return [];
        const p = (a: Node) => a.priority;
        // The list of nodes that have been processed.
        const frontier: Heap<Node> = new Heap<Node>(p);
        const startNode: Node = start as any as Node;
        startNode.priority = 0;
        frontier.push(startNode);
        const costs = new Map<number, number>();
        const cameFrom = new Map<number, Node>();
        costs.set(Grid.hash(start), 0);
        // While there are still nodes waiting to be processed
        while(frontier.size > 0) {
            // Find node with lowest f score, and remove from open list
            const current: Node = frontier.pop()!;
            
            // Calculate the new cost
            //
            // Because this works on a grid, this will always just add one.
            const newCost = costs.get(Grid.hash(current)) + 1;
            
            // For each valid neighbour of the tile.
            for(const next of Grid.neighbours(current)) {
                if(!isValid(next))
                    continue;
                // If the neighbour is the goal point
                if(pointEq(next, goal)) {
                    // Make a path from the neighbour node
                    const path = [];
                    let node = current, nodeHash = Grid.hash(node);
                    while(cameFrom.has(nodeHash)) {
                        const last = cameFrom.get(nodeHash)!;
                        path.push(node);
                        node = last;
                        nodeHash = Grid.hash(node);
                    }
                    cameFrom.get(nodeHash);
                    const p = path.reverse();
                    /*
                    console.log(`Path from ${start.x}, ${start.y} to ${goal.x}, ${goal.y}:`);
                    for(const m of p)
                        console.log(`\t${m.x}, ${m.y}`);*/
                    return p;
                }
                const nextHash = Grid.hash(next);
                if(!costs.has(nextHash) || newCost < costs.get(nextHash)) {
                    costs.set(nextHash, newCost);
                    next.priority = newCost + manhattan(goal, next);
                    frontier.push(next);
                    cameFrom.set(nextHash, current);
                }
            }
        }
        return [];
    }
    /// Fill an array of 4 nodes with each neighbour of the node.
    private static neighbours(node: Node): Node[] {
        return [
            {x: node.x + 1, y: node.y, priority: 0},
            {x: node.x - 1, y: node.y, priority: 0},
            {x: node.x, y: node.y + 1, priority: 0},
            {x: node.x, y: node.y - 1, priority: 0}
        ];
    }
    private static hash(p: Point): number {
        return (p.x << 16) | (p.y & 0xFFFF);
    }
}

interface Node extends Point {
    priority: number;
}