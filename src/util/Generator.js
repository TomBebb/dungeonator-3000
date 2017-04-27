define(["require", "exports", "./geom/Rectangle", "./geom/QuadTree", "./math"], function (require, exports, Rectangle_1, QuadTree_1, math_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Generator = (function () {
        function Generator(grid) {
            this.rooms = [];
            this.grid = grid;
            this.quadTree = new QuadTree_1.default(new Rectangle_1.Rectangle(0, 0, grid.width, grid.height));
        }
        Generator.prototype.placeOnGrid = function (room, numAttempts) {
            if (numAttempts === void 0) { numAttempts = 5; }
            var maybeRooms = [];
            do {
                maybeRooms.splice(0);
                room.width = math_1.random(Generator.MIN_ROOM_SIZE, Generator.MAX_ROOM_SIZE);
                room.height = math_1.random(Generator.MIN_ROOM_SIZE, Generator.MAX_ROOM_SIZE);
                room.x = math_1.random(Generator.EDGE_DISTANCE, this.grid.width - room.width - Generator.EDGE_DISTANCE * 2);
                room.y = math_1.random(Generator.EDGE_DISTANCE, this.grid.height - room.height - Generator.EDGE_DISTANCE * 2);
                this.quadTree.retrieve(room, maybeRooms);
            } while (maybeRooms.find(function (r) { return r.intersects(room, Generator.ROOM_SPACING); }) != undefined && --numAttempts > 0);
            return numAttempts > 0;
        };
        Generator.prototype.generate = function (numAttempts) {
            if (numAttempts === void 0) { numAttempts = 5; }
            this.grid.clear(1);
            var _num = numAttempts;
            while (this.rooms.length < Generator.NUM_ROOMS && --_num > 0) {
                var room = new Rectangle_1.Rectangle(0, 0, 0, 0);
                if (this.placeOnGrid(room)) {
                    this.grid.fill(room, 0);
                    this.grid.outline(room, 1);
                    _num = numAttempts;
                    this.rooms.push(room);
                    this.quadTree.insert(room);
                }
            }
            for (var i = 0; i < this.rooms.length; i++) {
                var corridors = math_1.random(Generator.MIN_ROOM_CORRIDORS, Generator.MAX_ROOM_CORRIDORS);
                for (var j = 1; j <= corridors; j++)
                    this.connect(this.rooms[i], this.rooms[(i + j) % this.rooms.length]);
            }
            this.grid.rooms = this.rooms;
        };
        Generator.prototype.connect = function (a, b) {
            var aMid = a.centre;
            var bMid = b.centre;
            if (Math.random() > 0.5) {
                for (var o = 0; o < Generator.CORRIDOR_WIDTH; o++) {
                    this.grid.hline(bMid.x, aMid.x, bMid.y + o, 0);
                    this.grid.vline(aMid.x + o, bMid.y, aMid.y, 0);
                }
            }
            else {
                for (var o = 0; o < Generator.CORRIDOR_WIDTH; o++) {
                    this.grid.vline(bMid.x + o, bMid.y, aMid.y, 0);
                    this.grid.hline(bMid.x, aMid.x, aMid.y + o, 0);
                }
            }
        };
        return Generator;
    }());
    Generator.EDGE_DISTANCE = 1;
    Generator.MIN_ROOM_SIZE = 10;
    Generator.MAX_ROOM_SIZE = 20;
    Generator.NUM_ROOMS = 20;
    Generator.ROOM_SPACING = 1;
    Generator.MIN_ROOM_CORRIDORS = 1;
    Generator.MAX_ROOM_CORRIDORS = 3;
    Generator.CORRIDOR_WIDTH = 2;
    exports.default = Generator;
});
