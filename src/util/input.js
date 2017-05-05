define(["require", "exports", "./geom/Point", "../scene/PlayScene"], function (require, exports, Point_1, PlayScene_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MultiInput = (function () {
        function MultiInput() {
            var inputs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                inputs[_i] = arguments[_i];
            }
            this.inputs = inputs;
            this.lastInput = inputs[0];
        }
        Object.defineProperty(MultiInput.prototype, "entity", {
            get: function () {
                return this._entity;
            },
            set: function (e) {
                this._entity = e;
                for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
                    var i = _a[_i];
                    i.entity = e;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MultiInput.prototype, "type", {
            get: function () {
                return this.lastInput.type;
            },
            enumerable: true,
            configurable: true
        });
        MultiInput.prototype.next = function () {
            for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
                var i = _a[_i];
                var v = i.next();
                if (v == "pause" || v != undefined) {
                    this.lastInput = i;
                    return v;
                }
            }
            return undefined;
        };
        return MultiInput;
    }());
    exports.MultiInput = MultiInput;
    var KeyboardInput = (function () {
        function KeyboardInput(scene) {
            var _this = this;
            this.buttons = new Set();
            this.type = "keyboard";
            scene.addEvent("keydown", function (e) {
                if (!e.repeat)
                    _this.buttons.add(e.keyCode);
            });
            scene.addEvent("keyup", function (e) {
                if (!e.repeat)
                    _this.buttons.delete(e.keyCode);
            });
        }
        KeyboardInput.prototype.next = function () {
            var x = this.entity.x, y = this.entity.y, TS = PlayScene_1.default.TILE_SIZE;
            if (this.buttons.has(13) || this.buttons.has(32) || this.buttons.has(27))
                return "pause";
            else if (this.buttons.has(37))
                return { x: x - TS, y: y };
            else if (this.buttons.has(38))
                return { x: x, y: y - TS };
            else if (this.buttons.has(39))
                return { x: x + TS, y: y };
            else if (this.buttons.has(40))
                return { x: x, y: y + TS };
            else
                return undefined;
        };
        return KeyboardInput;
    }());
    exports.KeyboardInput = KeyboardInput;
    var MouseInput = (function () {
        function MouseInput(scene) {
            var _this = this;
            this.type = "mouse";
            this.path = [];
            scene.addEvent("mousedown", function (e) {
                var TS = PlayScene_1.default.TILE_SIZE;
                var p = scene.fromGlobal(new Point_1.Point(e.offsetX, e.offsetY));
                var revPath = scene.map.grid.findPath(Point_1.Point.from(_this.entity, true, 1 / TS), Point_1.Point.from(p, false, 1 / TS));
                _this.path = revPath.reverse();
            });
        }
        MouseInput.prototype.clearPath = function () {
            this.path.splice(0);
        };
        MouseInput.prototype.next = function () {
            if (this.path.length > 0) {
                return Point_1.Point.from(this.path.pop(), true, 16);
            }
            else
                return undefined;
        };
        return MouseInput;
    }());
    exports.MouseInput = MouseInput;
    var FollowInput = (function () {
        function FollowInput() {
            this.type = undefined;
            this.path = [];
            this.sightDist = 6 * PlayScene_1.default.TILE_SIZE;
        }
        FollowInput.prototype.clearPath = function () {
            this.path.splice(0);
        };
        FollowInput.prototype.startFollowing = function (e) {
            this.follow = e;
            var x = this.entity.x, y = this.entity.y;
            var text = new PIXI.Text("!", {
                fill: "white"
            });
            text.position.set(x - text.width / 2, y - text.height);
            var frame;
            var scene = this.entity.scene;
            var intervalId = -1;
            frame = function () {
                text.alpha -= 0.1;
                if (text.alpha <= 0) {
                    scene.removeNonUi(text);
                    clearInterval(intervalId);
                }
            };
            intervalId = setInterval(frame, 30);
            scene.addNonUi(text);
        };
        FollowInput.prototype.canSee = function (p) {
            return p.distanceFrom(this.entity) < 2 * this.sightDist || (p.room != undefined && this.entity.room == p.room);
        };
        FollowInput.prototype.next = function () {
            if (this.follow == undefined)
                return this.entity;
            var f = this.follow, x = this.entity.x, y = this.entity.y, scene = this.entity.scene;
            if (x - f.x == 0 && y - f.y == 0)
                return this.entity;
            else if (this.path.length == 0) {
                var revPath = scene.map.grid.findPath(Point_1.Point.from(this.entity, true, 1 / 16), Point_1.Point.from(f, true, 1 / 16));
                revPath.splice(FollowInput.MAX_PATH_LENGTH);
                this.path = revPath.reverse();
            }
            if (this.path.length > 0) {
                return Point_1.Point.from(this.path.pop(), true, 16);
            }
            else
                return this.entity;
        };
        return FollowInput;
    }());
    FollowInput.MAX_PATH_LENGTH = 4;
    exports.FollowInput = FollowInput;
    var GamepadInput = (function () {
        function GamepadInput(index) {
            if (index === void 0) { index = 0; }
            this.type = "gamepad";
            this.index = index;
        }
        GamepadInput.prototype.next = function () {
            var gp = navigator.getGamepads()[this.index];
            if (gp == null)
                return undefined;
            if (gp.buttons[9].pressed)
                return "pause";
            var dx = gp.axes[0], dy = gp.axes[1], TS = PlayScene_1.default.TILE_SIZE;
            var x = this.entity.x, y = this.entity.y;
            x += Math.round(dx) * TS;
            y += Math.round(dy) * TS;
            if (x == this.entity.x && y == this.entity.y)
                return undefined;
            else if (x != this.entity.x)
                return { x: x, y: this.entity.y };
            else
                return { x: this.entity.x, y: y };
        };
        return GamepadInput;
    }());
    exports.GamepadInput = GamepadInput;
});
