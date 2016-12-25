define(["require", "exports", "../control", "../scene/PlayScene"], function (require, exports, control_1, PlayScene_1) {
    "use strict";
    class Dynamic extends PIXI.extras.AnimatedSprite {
        get animation() {
            return this.animationName;
        }
        set animation(n) {
            this.animationName = n;
            this.textures = this._animations[n];
        }
        constructor(source, anims, anim, x, y, frameWidth = 16, frameHeight = 18) {
            super(anims[anim]);
            this._animations = anims;
            this.animationName = anim;
            this.x = x;
            this.y = y;
            this.animationSpeed = 0.2;
            this.frameWidth = frameWidth;
            this.frameHeight = frameHeight;
            this.loop = true;
            this.play();
        }
        static makeAnims(source, fw, fh, anims) {
            const b = new PIXI.BaseTexture(PIXI.loader.resources[source].data);
            const a = {};
            for (const anim in anims) {
                const points = anims[anim];
                const textures = points.map((p) => new PIXI.Texture(b, new PIXI.Rectangle(p.x, p.y, fw, fh)));
                a[anim] = textures;
            }
            return a;
        }
    }
    exports.Dynamic = Dynamic;
    class Entity extends Dynamic {
        constructor(scene, control, source = "player", x = 0, y = 0) {
            super(source, Dynamic.makeAnims(source, 16, 16, {
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
            }), "stand_up", x, y);
            this.lastDir = 3;
            this.scene = scene;
            this.control = control;
            if (this.control instanceof control_1.FollowControl)
                this.control.entity = this;
        }
        tryMove() {
            const cdir = this.control.dir;
            if (cdir === undefined)
                return false;
            else {
                let [nx, ny] = control_1.toVector(cdir);
                [nx, ny] = [this.x + PlayScene_1.default.TILE_SIZE * nx, this.y + PlayScene_1.default.TILE_SIZE * ny];
                if (!this.scene.isValidPosition(nx, ny))
                    return false;
                [this.x, this.y] = [nx, ny];
                const anim = this.x === nx && this.y === ny ? "walk" : "stand";
                if (this.lastDir !== cdir || !this.animationName.startsWith(anim)) {
                    this.animation = `${anim}_${control_1.toString(cdir)}`;
                    this.lastDir = cdir;
                }
                return true;
            }
        }
        update(dt) {
            super.update(dt);
            const cdir = this.control.dir || this.lastDir;
            const scdir = control_1.toString(cdir);
            if (!this.animation.endsWith(scdir)) {
                this.animation = `${this.animation.split("_")[0]}_${scdir}`;
            }
        }
        static defaultPlayer(scene) {
            return new Entity(scene, new control_1.KeyboardControl(), undefined, 2 * PlayScene_1.default.TILE_SIZE, 2 * PlayScene_1.default.TILE_SIZE);
        }
        static defaultEnemy(scene) {
            return new Entity(scene, new control_1.FollowControl(scene), undefined, 10 * PlayScene_1.default.TILE_SIZE, 10 * PlayScene_1.default.TILE_SIZE);
        }
    }
    exports.Entity = Entity;
});
