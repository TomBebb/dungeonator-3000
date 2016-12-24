///<reference path='../util/immutable.d.ts'/>
import PlayScene from "../scene/PlayScene";

import { Rectangle, Point, pointHash, pointEq } from "../util/math";
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
    search(start: Point, end: Point, maxSearchDistance: number = 16): Immutable.OrderedSet<Node> {
        const nodes: Node[][] = [];
        const game: PlayScene = Main.instance.scene as PlayScene;
        for(let x = 0; x < this.width; x++) {
            nodes[x] = [];
            for(let y = 0; y < this.height; y++) {
                nodes[x][y] = new Node(x, y);
                nodes[x][y].walkable = game.isValidPosition(x, y);
            }
        };
        let closed = Immutable.Set<Node>();
        let open = Immutable.Set<Node>();
        const startNode = nodes[start.x][start.y]
        startNode.cost = 0;
        startNode.depth = 0;
        open = open.add(startNode);
        let maxDepth = 0;
        while(open.size > 0 && maxDepth < maxSearchDistance) {
            let current: Node = open.sort((a, b) => a.heuristic + a.cost - b.heuristic - b.cost).first();
            if(pointEq(current, end))
                return Grid.constructPath(current);
            open.delete(current);
            closed.add(current);
            this.neighbors(nodes, current).forEach((n) => {
                if(!closed.has(n) && n.walkable) {
                    const nextStepCost = current.cost + manhattan(n, end);
                    if(nextStepCost < n.cost) {
                        open = open.delete(n);
                        closed = closed.delete(n);
                    }
                    if(!open.has(n) && !closed.has(n)) {
                        n.cost = nextStepCost;
                        n.heuristic = manhattan(n, end);
                        n.parent = current;
                        maxDepth = Math.max(maxDepth, n.depth);
                        open = open.add(n);
                    }
                }
            });
        }
        return Immutable.OrderedSet<Node>();
    }
    /// Create a set containing each neighbour of the node.
    private neighbors(nodes: Node[][], node: Node): Immutable.Set<Node> {
        let ns = Immutable.Set<Node>();
        if(node.x - 1 >= 0)
            ns.add(nodes[node.x - 1][node.y]);
        if(node.x + 1 < this.width)
            ns.add(nodes[node.x + 1][node.y]);
        if(node.y - 1 >= 0)
            ns.add(nodes[node.x][node.y - 1]);
        if(node.y + 1 < this.height)
            ns.add(nodes[node.x][node.y + 1]);
        return ns;
    }
    /// Make a path from the node by joining up its parent to its parent etc.
    private static constructPath(node: Node): Immutable.OrderedSet<Node> {
        let path = Immutable.OrderedSet<Node>([node]);
        while(node.parent !== undefined) {
            node = node.parent!!;
            path = path.add(node);
        }
        return Immutable.OrderedSet(path.reverse());
    }
}

class Node {
    readonly x: number;
    readonly y: number;
    /// The path cost
    cost: number;
    /// The parent of this node
    private _parent: Node;
    heuristic: number;
    depth: number = -1;
    walkable: boolean = false;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    get parent() {
        return this._parent;
    }

    set parent(p: Node) {
        this.depth = p.depth + 1;
        this._parent  = p;
    }

}