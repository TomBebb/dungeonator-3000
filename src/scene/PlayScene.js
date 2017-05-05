var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "../ui/Chest", "../ui/Ladder", "../ui/Map", "../ui/Minimap", "../ui/Entity", "../util/input", "../util/math", "../util/geom/Point", "../util/save", "./Scene", "./PauseScene", "../main"], function (require, exports, Chest_1, Ladder_1, Map_1, Minimap_1, Entity_1, input_1, math_1, Point_1, save_1, Scene_1, PauseScene_1, main_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Text = PIXI.Text;
    var PlayScene = (function (_super) {
        __extends(PlayScene, _super);
        function PlayScene() {
            var _this = _super.call(this) || this;
            _this.enemies = [];
            _this.players = [];
            _this.entities = [];
            _this.items = [];
            _this.floorLabel = new Text('', {
                fontFamily: "sans",
                fontSize: 20,
                fill: "white",
                align: "left"
            });
            _this.coinsLabel = new Text('', {
                fontFamily: "sans",
                fontSize: 20,
                fill: "white",
                align: "left"
            });
            _this.inTurn = false;
            _this.gamepadPlayers = new Map();
            var s = save_1.load();
            _this.floor = 1;
            if (s != undefined && s.coins)
                _this.coins = s.coins;
            else
                _this.coins = 0;
            _this.pauseScene = new PauseScene_1.default(_this);
            _this.addUi(_this.floorLabel);
            _this.coinsLabel.x = main_1.default.instance.renderer.width / 2;
            _this.addUi(_this.coinsLabel);
            var r = main_1.default.instance.renderer;
            _this.map = new Map_1.default(128, 128);
            _this.addNonUi(_this.map);
            var ladder = new Ladder_1.default();
            _this.addItem(ladder);
            for (var i = 0; i < PlayScene.MIN_CHESTS; i++)
                _this.addItem(new Chest_1.default());
            for (var i = 0; i < PlayScene.MIN_ENEMIES; i++)
                _this.makeEnemy();
            setInterval(function () { return _this.startTurn(); }, PlayScene.TURN_DELAY * 1000);
            var gamepads = navigator.getGamepads() || [];
            _this.addEntity(Entity_1.default.defaultPlayer(_this));
            _this.minimap = new Minimap_1.default(_this.map.grid, _this.players, ladder);
            _this.minimap.position.set(r.width - _this.minimap.width - 10, 10);
            _this.addUi(_this.minimap);
            for (var _i = 0, gamepads_1 = gamepads; _i < gamepads_1.length; _i++) {
                var g = gamepads_1[_i];
                if (g !== undefined && g !== null)
                    _this.connectGamepad(g);
            }
            return _this;
        }
        Object.defineProperty(PlayScene.prototype, "floor", {
            get: function () {
                return this._floor;
            },
            set: function (v) {
                this._floor = v;
                this.floorLabel.text = "Floor: " + this.floor.toLocaleString(undefined, { minimumIntegerDigits: 3 });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PlayScene.prototype, "coins", {
            get: function () {
                return this._coins;
            },
            set: function (v) {
                this._coins = v;
                this.coinsLabel.text = "Coins: " + this.coins.toLocaleString(undefined, { minimumIntegerDigits: 6 });
            },
            enumerable: true,
            configurable: true
        });
        PlayScene.prototype.addEntity = function (e) {
            this.resetEntity(e);
            this.addNonUi(e);
            this.entities.push(e);
            (e.input instanceof input_1.FollowInput ? this.enemies : this.players).push(e);
        };
        PlayScene.prototype.resetEntity = function (e) {
            e.room = this.place(e);
            if (e.input instanceof input_1.FollowInput) {
                e.input.follow = undefined;
                e.input.clearPath();
            }
        };
        PlayScene.prototype.resetItem = function (item) {
            this.place(item);
        };
        PlayScene.prototype.addItem = function (item) {
            this.resetItem(item);
            this.items.push(item);
            this.addNonUi(item);
        };
        PlayScene.prototype.pause = function () {
            this.pauseScene.cacheAsBitmap = false;
            this.pauseScene.input = this.players[0].input.type;
            this.advance(this.pauseScene, false);
            this.pauseScene.cacheAsBitmap = true;
        };
        PlayScene.prototype.makeEnemy = function () {
            var e = Entity_1.default.newEnemy(this);
            this.addEntity(e);
            return e;
        };
        PlayScene.prototype.advanceFloor = function () {
            this.endTurn();
            var saveData = save_1.load();
            var f = ++this.floor;
            if (saveData == undefined)
                saveData = {
                    maxFloor: f,
                    coins: this.coins
                };
            else
                saveData.coins = this.coins;
            if (f > saveData.maxFloor)
                saveData.maxFloor = f;
            save_1.save(saveData);
            this.map.reset();
            for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
                var i = _a[_i];
                this.resetItem(i);
            }
            if (this.items.length - 1 < Math.min(this._floor, PlayScene.MAX_CHESTS))
                this.addItem(new Chest_1.default());
            for (var _b = 0, _c = this.entities; _b < _c.length; _b++) {
                var p = _c[_b];
                this.resetEntity(p);
            }
            if (this.enemies.length < Math.min(this._floor, PlayScene.MAX_ENEMIES))
                this.addEntity(Entity_1.default.newEnemy(this));
            this.minimap.redraw();
        };
        PlayScene.prototype.connectGamepad = function (g) {
            if (this.gamepadPlayers.has(g.index) || g.index == 0)
                return;
            var player = new Entity_1.default(this, new input_1.GamepadInput(g.index));
            this.addEntity(player);
            this.placeNear(this.players[0], player);
            this.gamepadPlayers.set(g.index, player);
        };
        PlayScene.prototype.checkAt = function (r) {
            if (this.map.isNotEmpty(r.x, r.y))
                return "tile";
            var item = this.items.find(function (p) { return Point_1.Point.eq(p, r); });
            if (item != undefined)
                return item;
            var entity = this.entities.find(function (p) { return p != r && Point_1.Point.eq(p, r); });
            if (entity != undefined)
                return entity;
            return undefined;
        };
        PlayScene.prototype.place = function (p, numAttempts) {
            if (numAttempts === void 0) { numAttempts = 5; }
            var r;
            do {
                r = math_1.randomIn(this.map.grid.rooms);
                if (this.placeIn(p, r, numAttempts))
                    return r;
            } while (this.checkAt(p) != undefined && --numAttempts > 0);
            return numAttempts > 0 ? r : undefined;
        };
        PlayScene.prototype.placeIn = function (p, r, numAttempts) {
            if (numAttempts === void 0) { numAttempts = 5; }
            do {
                p.x = (r.x + Math.floor(Math.random() * r.width)) * PlayScene.TILE_SIZE;
                p.y = (r.y + Math.floor(Math.random() * r.height)) * PlayScene.TILE_SIZE;
            } while (this.checkAt(p) != undefined && --numAttempts >= 0);
            return numAttempts < 0;
        };
        PlayScene.prototype.placeNear = function (t, n) {
            var radius = 2;
            for (t.x = n.x - radius; t.x <= n.x + radius; t.x += radius * 2) {
                for (t.y = n.y - radius; t.y <= n.y + radius; t.y += radius * 2) {
                    if (this.checkAt(t) == undefined)
                        return true;
                }
            }
            this.place(t);
            return false;
        };
        PlayScene.prototype.startTurn = function () {
            this.inTurn = true;
        };
        PlayScene.prototype.endTurn = function () {
            this.inTurn = false;
            for (var _i = 0, _a = this.enemies; _i < _a.length; _i++) {
                var e = _a[_i];
                e.moved = false;
            }
            for (var _b = 0, _c = this.players; _b < _c.length; _b++) {
                var e = _c[_b];
                e.moved = false;
            }
            this.minimap.redraw();
        };
        PlayScene.prototype.tryMoveEntity = function (e) {
            return e.moved || e.tryMove();
        };
        PlayScene.prototype.enemiesSeeing = function (arr, p) {
            for (var _i = 0, _a = this.enemies; _i < _a.length; _i++) {
                var e = _a[_i];
                if (e.input.canSee(p))
                    arr.push(e);
            }
        };
        PlayScene.prototype.update = function (_) {
            var gamepads = navigator.getGamepads() || [];
            for (var _i = 0, gamepads_2 = gamepads; _i < gamepads_2.length; _i++) {
                var g = gamepads_2[_i];
                if (g != undefined && !this.gamepadPlayers.has(g.index))
                    this.connectGamepad(g);
            }
            if (this.inTurn) {
                var enemies = [];
                var numMoved = 0;
                for (var _a = 0, _b = this.players; _a < _b.length; _a++) {
                    var p = _b[_a];
                    if (this.tryMoveEntity(p)) {
                        enemies.splice(0);
                        this.enemiesSeeing(enemies, p);
                        for (var _c = 0, enemies_1 = enemies; _c < enemies_1.length; _c++) {
                            var e = enemies_1[_c];
                            if (e.input.follow != p)
                                e.input.startFollowing(p);
                        }
                        numMoved++;
                    }
                }
                for (var _d = 0, _e = this.enemies; _d < _e.length; _d++) {
                    var e = _e[_d];
                    if (this.tryMoveEntity(e))
                        numMoved++;
                }
                if (numMoved == this.enemies.length + this.players.length)
                    this.endTurn();
            }
            var tx = 0, ty = 0;
            for (var _f = 0, _g = this.players; _f < _g.length; _f++) {
                var p = _g[_f];
                tx += p.x;
                ty += p.y;
            }
            var r = main_1.default.instance.renderer;
            tx /= this.players.length;
            ty /= this.players.length;
            tx = math_1.clamp(tx, r.width / 2, this.map.width - r.width / 2);
            ty = math_1.clamp(ty, r.height / 2, this.map.height - r.height / 2);
            this.setCamera(tx, ty);
        };
        return PlayScene;
    }(Scene_1.default));
    PlayScene.TILE_SIZE = 16;
    PlayScene.MIN_CHESTS = 0;
    PlayScene.MAX_CHESTS = 8;
    PlayScene.MAX_ENEMIES = 20;
    PlayScene.MIN_ENEMIES = 5;
    PlayScene.TURN_DELAY = 0.1;
    exports.default = PlayScene;
});
