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
define(["require", "exports", "../util/geom/Point", "../util/math", "../util/input", "./Item"], function (require, exports, Point_1, math_1, input_1, Item_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AnimatedSprite = PIXI.extras.AnimatedSprite;
    var Dynamic = (function (_super) {
        __extends(Dynamic, _super);
        function Dynamic(anims, anim, x, y, frameWidth, frameHeight) {
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
    }(AnimatedSprite));
    exports.Dynamic = Dynamic;
    var Coin = (function (_super) {
        __extends(Coin, _super);
        function Coin(scene, x, y) {
            var _this = _super.call(this, Dynamic.makeAnims("coins", 16, 16, {
                still: [{ x: 0, y: 0 }],
                spin: [{ x: 0, y: 0 }, { x: 16, y: 0 }, { x: 32, y: 0 }, { x: 48, y: 0 }, { x: 64, y: 0 }, { x: 80, y: 0 }, { x: 96, y: 0 }, { x: 111, y: 0 },]
            }), "spin", x, y) || this;
            _this.scene = scene;
            _this.play();
            return _this;
        }
        Coin.prototype.update = function (dt) {
            _super.prototype.update.call(this, dt);
            this.y -= dt * 0.2;
            this.alpha -= dt * 0.01;
            if (this.alpha <= 0)
                this.scene.removeNonUi(this);
        };
        return Coin;
    }(Dynamic));
    exports.Coin = Coin;
    var Entity = (function (_super) {
        __extends(Entity, _super);
        function Entity(scene, input, source, moveInterval, x, y) {
            if (source === void 0) { source = "player"; }
            if (moveInterval === void 0) { moveInterval = 1; }
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            var _this = _super.call(this, Dynamic.makeAnims(source, 16, 18, {
                stand_up: [{ x: 0, y: 0 }],
                stand_right: [{ x: 0, y: 18 }],
                stand_down: [{ x: 0, y: 36 }],
                stand_left: [{ x: 0, y: 54 }],
                walk_up: [
                    { x: 0, y: 0 },
                    { x: 16, y: 0 },
                    { x: 32, y: 0 }
                ],
                walk_right: [
                    { x: 0, y: 18 },
                    { x: 16, y: 18 },
                    { x: 32, y: 18 }
                ],
                walk_down: [
                    { x: 0, y: 36 },
                    { x: 16, y: 36 },
                    { x: 32, y: 36 }
                ],
                walk_left: [
                    { x: 0, y: 54 },
                    { x: 16, y: 54 },
                    { x: 32, y: 54 }
                ]
            }), "stand_up", x, y) || this;
            _this.moved = false;
            _this.moves = 0;
            _this.input = input;
            input.entity = _this;
            _this.pivot.set(0, 2);
            _this.scene = scene;
            _this.lastPoint = new Point_1.Point(x, y);
            _this.moveInterval = moveInterval;
            return _this;
        }
        Entity.prototype.distanceFrom = function (p) {
            return math_1.manhattanDistance(this.x, this.y, p.x, p.y);
        };
        Entity.prototype.nextPoint = function () {
            var i = this.input.next();
            if (i == "pause") {
                this.scene.pause();
                return undefined;
            }
            else
                return i;
        };
        Entity.prototype.isEnemy = function () {
            return this.input instanceof input_1.FollowInput;
        };
        Entity.prototype.tryMove = function () {
            var _this = this;
            this.moves++;
            if (this.moves < this.moveInterval)
                return true;
            this.moves -= this.moveInterval;
            var p = this.nextPoint();
            if ((p == undefined || p == this) && this.animation.startsWith('walk_'))
                this.animation = this.animation.replace('walk_', 'stand_');
            if (p == undefined)
                return false;
            if (p == this)
                return true;
            var last = this.lastPoint;
            this.x = p.x;
            this.y = p.y;
            var interaction = this.scene.checkAt(this);
            if (this.isEnemy() && interaction != undefined && interaction instanceof Entity && !interaction.isEnemy()) {
                var entity = interaction;
                this.scene.place(entity);
            }
            else if (interaction != undefined) {
                var item = (interaction instanceof Item_1.default) ? interaction : null;
                this.x = last.x;
                this.y = last.y;
                if (item != null)
                    item.interact(this);
                return false;
            }
            if (this.room == undefined || !this.room.contains(this.x, this.y)) {
                var rooms = this.scene.map.quadTree.retrieve(this);
                this.room = rooms.find(function (room) { return room.intersects(_this, 0); });
            }
            this.moved = true;
            var dy = this.y - last.y, dx = this.x - last.x;
            if (Math.abs(dy) > Math.abs(dx))
                this.animation = 'walk_' + (dy > 0 ? 'down' : 'up');
            else
                this.animation = 'walk_' + (dx > 0 ? 'right' : 'left');
            this.lastPoint = p;
            return true;
        };
        Entity.defaultPlayer = function (scene) {
            return new Entity(scene, new input_1.MultiInput(new input_1.KeyboardInput(scene), new input_1.MouseInput(scene), new input_1.GamepadInput(0)));
        };
        Entity.newEnemy = function (scene) {
            return new Entity(scene, new input_1.FollowInput(), "zombie");
        };
        return Entity;
    }(Dynamic));
    exports.Entity = Entity;
    exports.default = Entity;
});
