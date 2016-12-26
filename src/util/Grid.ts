import PlayScene from "../scene/PlayScene";

import { Rectangle, Point, pointHash, pointEq } from "../util/math"
import Main from "../main";
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
    findPath(start: Point, goal: Point, max: number = 10, isValid: (p: Point) => boolean = (p) => this.isValidAt(p)): Node[] {
        if(!isValid(start) || !isValid(goal) || pointEq(start, goal))
            return [];
        const p = (n: Node) => n.f || 0;
        const closed: Heap<Node> = new Heap<Node>(p);
        const open: Heap<Node> = new Heap<Node>(p);
        open.push({
            g: 0,
            h: 0,
            f: 0,
            x: start.x,
            y: start.y
        });
        while(open.size > 0) {
            // Find node with lowest f score, and remove from open list
            const q: Node = open.pop()!;
            // Push to closed list
            closed.push(q);
            for(const n of this.neighbors(q, isValid)) {
                if(pointEq(n, goal))
                    return Grid.constructPath(n);
                n.h = manhattan(goal, n);
                n.f = n.g + n.h;
                const nEq = (v: Node) => pointEq(v, n);
                if(n.g < max && !open.allUnder(n).find(nEq) && !closed.allUnder(n).find(nEq))
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

interface Node {
    readonly parent?: Node;
    readonly x: number;
    readonly y: number;
    /// The cost to get to the node
    g: number;
    /// The guessed cost
    h?: number;
    f?: number;
}