var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../control", "../scene/PlayScene"], function (require, exports, control_1, PlayScene_1) {
    "use strict";
    var Dynamic = (function (_super) {
        __extends(Dynamic, _super);
        function Dynamic(source, anims, anim, x, y, frameWidth, frameHeight) {
            if (frameWidth === void 0) { frameWidth = 16; }
            if (frameHeight === void 0) { frameHeight = 18; }
            var _this = _super.call(this, anims[anim]) || this;
            _this._animations = anims;
            _this.animationName = anim;
            _this.x = x;
            _this.y = y;
            _this.animationSpeed = 0.2;
            _this.frameWidth = frameWidth;
            _this.frameHeight = frameHeight;
            _this.loop = true;
            _this.play();
            return _this;
        }
        Object.defineProperty(Dynamic.prototype, "animation", {
            get: function () {
                return this.animationName;
            },
            set: function (n) {
                this.animationName = n;
                this.textures = this._animations[n];
            },
            enumerable: true,
            configurable: true
        });
        Dynamic.makeAnims = function (source, fw, fh, anims) {
            var b = new PIXI.BaseTexture(PIXI.loader.resources[source].data);
            var a = {};
            for (var anim in anims) {
                var points = anims[anim];
                var textures = points.map(function (p) { return new PIXI.Texture(b, new PIXI.Rectangle(p.x, p.y, fw, fh)); });
                a[anim] = textures;
            }
            return a;
        };
        return Dynamic;
    }(PIXI.extras.AnimatedSprite));
    exports.Dynamic = Dynamic;
    var Entity = (function (_super) {
        __extends(Entity, _super);
        function Entity(scene, control, source, x, y) {
            if (source === void 0) { source = "player"; }
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            var _this = _super.call(this, source, Dynamic.makeAnims(source, 16, 16, {
                stand_up: [{ x: 0, y: 0 }],
                stand_right: [{ x: 0, y: 18 }],
                stand_down: [{ x: 0, y: 36 }],
                stand_left: [{ x: 0, y: 54 }],
                walk_up: [
                    { x: 0, y: 0 },
                    { x: 16, y: 0 },
                    { x: 32, y: 0 },
                    { x: 48, y: 0 },
                ],
                walk_right: [
                    { x: 0, y: 18 },
                    { x: 16, y: 18 },
                    { x: 32, y: 18 },
                    { x: 48, y: 18 },
                ],
                walk_down: [
                    { x: 0, y: 36 },
                    { x: 16, y: 36 },
                    { x: 32, y: 36 },
                    { x: 48, y: 36 },
                ],
                walk_left: [
                    { x: 0, y: 54 },
                    { x: 16, y: 54 },
                    { x: 32, y: 54 },
                    { x: 48, y: 54 },
                ]
            }), "stand_up", x, y) || this;
            _this.lastDir = undefined;
            _this.scene = scene;
            _this.control = control;
            if (_this.control instanceof control_1.FollowControl)
                _this.control.entity = _this;
            return _this;
        }
        Entity.prototype.tryMove = function () {
            var cdir = this.control.dir;
            if (cdir === undefined)
                return false;
            else {
                var _a = control_1.toVector(cdir), nx = _a[0], ny = _a[1];
                _b = [this.x + PlayScene_1.default.TILE_SIZE * nx, this.y + PlayScene_1.default.TILE_SIZE * ny], nx = _b[0], ny = _b[1];
                if (!this.scene.isValidPosition(nx / PlayScene_1.default.TILE_SIZE, ny / PlayScene_1.default.TILE_SIZE))
                    return false;
                _c = [nx, ny], this.x = _c[0], this.y = _c[1];
                var anim = this.x === nx && this.y === ny ? "walk" : "stand";
                if (this.lastDir !== cdir || !this.animationName.startsWith(anim)) {
                    this.animation = anim + "_" + control_1.toString(cdir);
                    this.lastDir = cdir;
                }
                return true;
            }
            var _b, _c;
        };
        Entity.defaultPlayer = function (scene) {
            return new Entity(scene, new control_1.KeyboardControl(), undefined, 2 * PlayScene_1.default.TILE_SIZE, 2 * PlayScene_1.default.TILE_SIZE);
        };
        Entity.defaultEnemy = function (scene) {
            return new Entity(scene, new control_1.FollowControl(scene), undefined, 10 * PlayScene_1.default.TILE_SIZE, 10 * PlayScene_1.default.TILE_SIZE);
        };
        return Entity;
    }(Dynamic));
    exports.Entity = Entity;
});
