///<reference path='../util/immutable.d.ts'/>
import PlayScene from "../scene/PlayScene";

import { Rectangle, Point, pointHash, pointEq } from "../util/math"
import Main from "../main";
import { manhattan } from "../path/heuristic"; 
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
    /// Fill the rectangle `r` with the color `c`
    fill(r: Rectangle, c: number = 1): void {
        for (let x = r.x; x < r.x + r.width; x++)
            for (let y = r.y; y < r.y + r.height; y++)
                this.tiles[this.index(x, y)] = c;
    }
    line(r: Rectangle, c: number = 1): void {
        for (let x = r.x; x <= r.x + r.width; x++) {
            this.tiles[this.index(x, r.y)] = c;
            this.tiles[this.index(x, r.y + r.height)] = c;
        }
        for (let y = r.y; y <= r.y + r.height; y++) {
            this.tiles[this.index(r.x, y)] = c;
            this.tiles[this.index(r.x + r.width, y)] = c;
        }
    }
    clear(): void {
        this.tiles.fill(1);
        this.fill({x: 1, y: 1, width: this.width - 2, height: this.height - 2}, 0);
    }
    private index(x: number, y: number): number {
        return x + y * this.width;
    }
    tileAt(x: number, y: number): number {
        return this.tiles[this.index(x, y)];
    }
    setTileAt(x: number, y: number, v: number) {
        this.tiles[this.index(x, y)] = v;
    }
    /// Returns true when the position {x, y} is in the grid and empty
    isValidPosition(x: number, y: number): boolean {
        return x >= 0 && y >= 0 && x < this.width && y < this.height && this.tileAt(x, y) == 0;
    }
    findPath(start: Point, goal: Point, max: number = 24): Node[] {
        const closed: Node[] = [];
        const open: Node[] = [{
            g: 0,
            h: 0,
            f: 0,
            x: start.x,
            y: start.y
        }];
        while(open.length > 0) {
            // Find lowest f score
            const q = open.reduce((a, b) => a.f < b.f ? a : b);
            // Remove from open list
            open.splice(open.findIndex((v) => v == q), 1);
            // Push to closed list
            closed.push(q);
            for(const n of this.neighbors(q)) {
                if(pointEq(n, goal))
                    return Grid.constructPath(n);
                n.h = manhattan(goal, n);
                n.f = n.g + n.h;
                if(n.g < max && !open.find((p) => pointEq(p, n) && p.f < n.f) && !closed.find((p) => pointEq(p, n) && p.f < n.f))
                    open.push(n);
            }
        }
        return [];
    }
    /// Create a set containing each neighbour of the node.
    private neighbors(node: Node): Node[] {
        return [
            { parent: node, g: node.g + 1, x:  node.x - 1, y: node.y},
            { parent: node, g: node.g + 1, x:  node.x + 1, y: node.y},
            { parent: node, g: node.g + 1, x:  node.x, y: node.y - 1},
            { parent: node, g: node.g + 1, x:  node.x, y: node.y + 1},
        ].filter((n) => this.isValidPosition(n.x, n.y));
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