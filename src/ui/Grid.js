define(["require", "exports", "../util/math", "../scene/PlayScene", "../main", "../path/heuristic"], function (require, exports, math_1, PlayScene_1, main_1, heuristic_1) {
    "use strict";
    class Grid {
        constructor(width, height) {
            this.canvas = document.createElement("canvas");
            this.canvas.width = width * PlayScene_1.default.TILE_SIZE;
            this.canvas.height = height * PlayScene_1.default.TILE_SIZE;
            this.context = this.canvas.getContext("2d");
            this.tiles = new Int8Array(width * height);
            this.width = width;
            this.height = height;
            this.canvas.style.display = "none";
            this.clear();
            document.body.appendChild(this.canvas);
            const assets = main_1.default.instance.assets;
            this.emptyTile = assets.getImage("blank.png");
            this.wallTile = assets.getImage("wall1.png");
            this.internalDraw();
        }
        fill(r, c = 1) {
            for (let x = r.x; x < r.x + r.width; x++)
                for (let y = r.y; y < r.y + r.height; y++)
                    this.tiles[this.index(x, y)] = c;
        }
        line(r, c = 1) {
            for (let x = r.x; x <= r.x + r.width; x++) {
                this.tiles[this.index(x, r.y)] = c;
                this.tiles[this.index(x, r.y + r.height)] = c;
            }
            for (let y = r.y; y <= r.y + r.height; y++) {
                this.tiles[this.index(r.x, y)] = c;
                this.tiles[this.index(r.x + r.width, y)] = c;
            }
        }
        clear() {
            this.tiles.fill(1);
            this.fill({ x: 1, y: 1, width: this.width - 2, height: this.height - 2 }, 0);
        }
        index(x, y) {
            return x + y * this.width;
        }
        tileAt(x, y) {
            return this.tiles[this.index(x, y)];
        }
        isValidPosition(x, y) {
            return x >= 0 && y >= 0 && x < this.width && y < this.height && this.tileAt(x, y) == 0;
        }
        internalDraw() {
            this.context.strokeStyle = "0.5px black";
            for (let y = 0; y < this.height; y++)
                for (let x = 0; x < this.width; x++)
                    this.context.drawImage(this.tiles[this.index(x, y)] ? this.wallTile : this.emptyTile, x * PlayScene_1.default.TILE_SIZE, y * PlayScene_1.default.TILE_SIZE);
        }
        render(c) {
            c.drawImage(this.canvas, 0, 0);
        }
        search(start, end, maxSearchDistance = 16) {
            const nodes = [];
            const game = main_1.default.instance.scene;
            for (let x = 0; x < this.width; x++) {
                nodes[x] = [];
                for (let y = 0; y < this.height; y++) {
                    nodes[x][y] = new Node(x, y);
                    nodes[x][y].walkable = game.isValidPosition(x, y);
                }
            }
            ;
            let closed = Immutable.Set();
            let open = Immutable.Set();
            const startNode = nodes[start.x][start.y];
            startNode.cost = 0;
            startNode.depth = 0;
            open = open.add(startNode);
            let maxDepth = 0;
            while (open.size > 0 && maxDepth < maxSearchDistance) {
                let current = open.sort((a, b) => a.heuristic + a.cost - b.heuristic - b.cost).first();
                if (math_1.pointEq(current, end))
                    return Grid.constructPath(current);
                open.delete(current);
                closed.add(current);
                this.neighbors(nodes, current).forEach((n) => {
                    if (!closed.has(n) && n.walkable) {
                        const nextStepCost = current.cost + heuristic_1.manhattan(n, end);
                        if (nextStepCost < n.cost) {
                            open = open.delete(n);
                            closed = closed.delete(n);
                        }
                        if (!open.has(n) && !closed.has(n)) {
                            n.cost = nextStepCost;
                            n.heuristic = heuristic_1.manhattan(n, end);
                            n.parent = current;
                            maxDepth = Math.max(maxDepth, n.depth);
                            open = open.add(n);
                        }
                    }
                });
            }
            return Immutable.OrderedSet();
        }
        neighbors(nodes, node) {
            let ns = Immutable.Set();
            if (node.x - 1 >= 0)
                ns.add(nodes[node.x - 1][node.y]);
            if (node.x + 1 < this.width)
                ns.add(nodes[node.x + 1][node.y]);
            if (node.y - 1 >= 0)
                ns.add(nodes[node.x][node.y - 1]);
            if (node.y + 1 < this.height)
                ns.add(nodes[node.x][node.y + 1]);
            return ns;
        }
        static constructPath(node) {
            let path = Immutable.OrderedSet([node]);
            while (node.parent !== undefined) {
                node = node.parent;
                path = path.add(node);
            }
            return Immutable.OrderedSet(path.reverse());
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Grid;
    class Node {
        constructor(x, y) {
            this.depth = -1;
            this.walkable = false;
            this.x = x;
            this.y = y;
        }
        get parent() {
            return this._parent;
        }
        set parent(p) {
            this.depth = p.depth + 1;
            this._parent = p;
        }
    }
});
//# sourceMappingURL=Grid.js.map