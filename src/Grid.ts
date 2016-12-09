import Game from "./Game";
import { Rectangle, Point, pointEq } from "./math";
import { lowest } from "./util";

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
    readonly emptyTile: HTMLImageElement = document.createElement("img");
    readonly wallTile: HTMLImageElement = document.createElement("img");
    constructor(width: number, height: number) {
        this.emptyTile.src = "assets/blank.png";
        this.wallTile.src = "assets/wall1.png";
        this.canvas = document.createElement("canvas");
        this.canvas.width = width * Game.TILE_SIZE;
        this.canvas.height = height * Game.TILE_SIZE;
        this.context = this.canvas.getContext("2d") !;
        this.tiles = new Int8Array(width * height);
        this.width = width;
        this.height = height;
        this.canvas.style.display = "none";
        document.body.appendChild(this.canvas);
        this.clear();
        this.emptyTile.onload = this.internalDraw.bind(this);
        this.wallTile.onload = this.internalDraw.bind(this);
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
    isValidPosition(x: number, y: number): boolean {
        return x >= 0 && y >= 0 && x < this.width && y < this.height && this.tileAt(x, y) == 0;
    }
    /// Draw to the grid's internal buffer
    internalDraw(): void {
        this.context.strokeStyle = "0.5px black";
        for (let y = 0; y < this.height; y++)
            for (let x = 0; x < this.width; x++)
                this.context.drawImage(this.tiles[this.index(x, y)] ? this.wallTile : this.emptyTile, x * Game.TILE_SIZE, y * Game.TILE_SIZE);
    }
    render(c: CanvasRenderingContext2D): void {
        c.drawImage(this.canvas, 0, 0);
    }


    findPath(start: Point, goal: Point): Set<Point> | null {
        const openList: Set<Node> = new Set<Node>();
        const closedList: Set<Node> = new Set<Node>();
        openList.add(Object.assign({
            g: 0,
            f: 0 + this.heuristic(start, goal)
        }, start));
        while(openList.size > 0) {
            const current: Node = lowest<Node>(openList.values(), (v: Node) => v.f!!)!!;
            if(pointEq(current, goal))
                return this.constructPath(current);
            openList.delete(current);
            closedList.add(current);
            for(let neighbor of this.neighbors(current)) {
                if(!closedList.has(neighbor)) {
                    neighbor.f = neighbor.g + this.heuristic(neighbor, goal);
                }
            }
        }
        return null;
    }
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
        return new Set(nodes.filter((v) => this.isValidPosition(v.x, v.y)));
    }

    private heuristic(p: Point, g: Point): number {
        return Math.abs(p.x - g.x) + Math.abs(p.y - g.y);
    }
    private constructPath(node: Node): Set<Node> {
        const path = new Set([node]);
        while(node.parent !== null) {
            node = node.parent!!;
            path.add(node);
        }
        return path;
    }
}

interface Node extends Point {
    parent?: Node;
    g: number;
    /// total cost of the path via current node
    f?: number;
}
