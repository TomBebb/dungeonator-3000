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
    findPath(start: Point, goal: Point, max: number = 10, isValid: (p: Point) => boolean = (p) => this.isValidAt(p)): Node[] {
        // If one of the start or end points is invalid or the start point is the goal point.
        if(!isValid(start) || !isValid(goal) || pointEq(start, goal))
            return [];
        const p = (n: Node) => n.f || 0;
        // The list of nodes that have been processed.
        const closed: Heap<Node> = new Heap<Node>(p);
        // The list of nodes that should be processed.
        const open: Heap<Node> = new Heap<Node>(p);
        open.push({
            g: 0,
            h: 0,
            f: 0,
            x: start.x,
            y: start.y
        });
        // While there are still nodes waiting to be processed
        while(open.size > 0) {
            // Find node with lowest f score, and remove from open list
            const q: Node = open.pop()!;
            // Push to closed list
            closed.push(q);
            // For each valid neighbour of the tile.
            for(const n of this.neighbors(q, isValid)) {
                // If the neighbour is the goal point
                if(pointEq(n, goal))
                    // Make a path from the neighbour node
                    return Grid.constructPath(n);
                // Save result of heuristic
                n.h = manhattan(goal, n);
                // Make score from combined distance to point and cost to get to it
                n.f = n.g + n.h;
                // Make a function that returns true when the node given is in the same place as the paramete.
                const nEq = (v: Node) => pointEq(v, n);
                // If the node is within a certain number of steps away, and there are no nodes in the open and closed lists with lower scores.
                if(n.g < max && !open.allUnder(n).find(nEq) && !closed.allUnder(n).find(nEq))
                    // Add the node to the open list, so the node can be processed by another iteration of the while loop
                    open.push(n);
            }
        }
        return [];
    }
    /// Create a set containing each neighbour of the node.
    private neighbors(node: Node, isValid: (p: Point) => boolean): Node[] {
        return [
            { parent: node, g: node.g + 1, x:  node.x - 1, y: node.y},
            { parent: node, g: node.g + 1, x:  node.x + 1, y: node.y},
            { parent: node, g: node.g + 1, x:  node.x, y: node.y - 1},
            { parent: node, g: node.g + 1, x:  node.x, y: node.y + 1},
        ].filter(isValid);
    }
    /// Make a path from the node by joining up its parent to its parent etc.
    private static constructPath(node: Node): Node[] {
        let path = [node];
        while(node.parent !== undefined) {
            node = node.parent!!;
            path.push(node);
        }
        return path;
    }
}

/// The structure points are extended with so each point stores the cost to get to it as well.
interface Node extends Point {
    readonly parent?: Node;
    /// The cost to get to the node
    g: number;
    /// The guessed cost
    h?: number;
    /// The total cost i.e. g + h.
    f?: number;
}