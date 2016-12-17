import { Rectangle, Point, pointEq } from "./util/math";
import Assets from "./util/Assets";
import { lowest } from "./util/util";
import Game from "./Game";


/// Structural interfaces are cool
interface Node extends Point {
    parent?: Node;
    g: number;
    /// total cost of the path via current node
    f?: number;
}

/// A 2D Grid
export default class Grid {
    /// The byte array the tiles are stored in.
    readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
    /// The byte array the tiles are stored in.
    protected readonly tiles: Int8Array;
    /// The width of the grid in tiles.
    readonly width: number;
    /// The height of the grid in tiles.
    readonly height: number;
    private emptyTile: HTMLImageElement;
    private wallTile: HTMLImageElement;
    constructor(width: number, height: number, assets: Promise<Assets>) {
        // Initialise the grid
        this.canvas = document.createElement("canvas")
        this.canvas.width = width * Game.TILE_SIZE;
        this.canvas.height = height * Game.TILE_SIZE;
        this.context = this.canvas.getContext("2d")!;
        this.tiles = new Int8Array(width * height);
        this.width = width;
        this.height = height;
        this.canvas.style.display = "none";
        this.clear();
        document.body.appendChild(this.canvas);
        // Set a callback
        assets.then((assets: Assets) => {
            console.log(assets);
            this.emptyTile = assets.getImage("blank.png")!;
            this.wallTile = assets.getImage("wall1.png")!;
            this.internalDraw();
        });
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
    private tileAt(x: number, y: number): number {
        return this.tiles[this.index(x, y)];
    }
    /// Returns true when the position {x, y} is in the grid and empty
    isValidPosition(x: number, y: number): boolean {
        return x >= 0 && y >= 0 && x < this.width && y < this.height && this.tileAt(x, y) == 0;
    }
    /// Draw to the grid's internal buffer
    internalDraw(): void {
        if(this.emptyTile === undefined)
            return;
        this.context.strokeStyle = "0.5px black";
        for (let y = 0; y < this.height; y++)
            for (let x = 0; x < this.width; x++)
                this.context.drawImage(this.tiles[this.index(x, y)] ? this.wallTile : this.emptyTile, x * Game.TILE_SIZE, y * Game.TILE_SIZE);
    }
    render(c: CanvasRenderingContext2D): void {
        c.drawImage(this.canvas, 0, 0);
    }


    findPath(start: Point, goal: Point, heuristic: (a: Point, b: Point) => number): Set<Point> | null {
        const openList: Set<Node> = new Set<Node>();
        const closedList: Set<Node> = new Set<Node>();
        openList.add(Object.assign({
            g: 0,
            f: 0 + heuristic(start, goal)
        }, start));
        while(openList.size > 0) {
            const current: Node = lowest<Node>(openList.values(), (v: Node) => v.f!!)!!;
            if(pointEq(current, goal))
                return this.constructPath(current);
            openList.delete(current);
            closedList.add(current);
            for(let neighbor of this.neighbors(current)) {
                if(!closedList.has(neighbor)) {
                    neighbor.f = neighbor.g + heuristic(neighbor, goal);
                }
            }
        }
        return null;
    }
    /// Create a set containing each neighbour of the node.
    private neighbors(node: Node): Set<Node> {
        const nodes = new Array<Node>(4);
        nodes.push({
            x: node.x - 1,
            y: node.y,
            parent: node,
            g: node.g + 1
        });
        nodes.push({
            x: node.x + 1,
            y: node.y,
            parent: node,
            g: node.g + 1
        });

        nodes.push({
            x: node.x,
            y: node.y - 1,
            parent: node,
            g: node.g + 1
        });
        nodes.push({
            x: node.x,
            y: node.y + 1,
            parent: node,
            g: node.g + 1
        });
        // only keep the nodes that have valid positions on the grid.
        return new Set(nodes.filter((v) => this.isValidPosition(v.x, v.y)));
    }
    /// Make a path from the node by joining up its parent to its parent etc.
    private constructPath(node: Node): Set<Node> {
        const path = new Set([node]);
        while(node.parent !== null) {
            node = node.parent!!;
            path.add(node);
        }
        return path;
    }
}
