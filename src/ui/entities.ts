import { toString, Direction, KeyboardControl, FollowControl, Control, toVector } from "../control";
import PlayScene from "../scene/PlayScene";
import { Point } from "../util/math";
import Main from "../main";

export interface Animations {
    [index: string]: PIXI.Texture[];
}
export interface AnimationsDef {
    [index: string]: Point[];
}
/// An animated sprite.
export class Dynamic extends PIXI.extras.AnimatedSprite {
    readonly frameWidth: number;
    readonly frameHeight: number;
    private readonly _animations: Animations;
    protected animationName: string;
    get animation() {
        return this.animationName;
    }
    set animation(n: string) {
        this.animationName = n;
        this.textures = this._animations[n];
    }
    constructor(source: string, anims: Animations, anim: string, x: number, y: number, frameWidth: number = 16, frameHeight: number = 18) {
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

    static makeAnims(source: string, fw: number, fh: number, anims: AnimationsDef): Animations {
        const b = new PIXI.BaseTexture(PIXI.loader.resources[source].data);
        const a: Animations = {};
        for(const anim in anims) {
            const points = anims[anim];
            const textures = points.map((p) => new PIXI.Texture(b, new PIXI.Rectangle(p.x, p.y, fw, fh)));
            a[anim] = textures;
        }
        return a;
    }

}

/// A sprite that can move.
///
/// This uses generics to make it able to use any control (such as gamepad or chase).
export class Entity<C extends Control> extends Dynamic {
    /// The source of input that controls this entity.
    readonly control: C;
    /// The scene instance the entity is attached to.
    readonly scene: PlayScene;
    private lastDir: Direction = Direction.Down;

    constructor(scene: PlayScene, control: C, source: string = "player", x: number = 0, y: number = 0) {
        super(source, Dynamic.makeAnims(source, 16, 16, {
            stand_up: [ {x: 0, y: 0} ],
            stand_right: [ {x: 0, y: 18} ],
            stand_down: [ {x: 0, y: 36} ],
            stand_left: [ {x: 0, y: 54} ],
            walk_up: [
                {x: 0, y: 0},
                {x: 16, y: 0},
                {x: 32, y: 0},
                {x: 48, y: 0},
            ],
            walk_right: [
                {x: 0, y: 18},
                {x: 16, y: 18},
                {x: 32, y: 18},
                {x: 48, y: 18},
            ],
            walk_down: [
                {x: 0, y: 36},
                {x: 16, y: 36},
                {x: 32, y: 36},
                {x: 48, y: 36},
            ],
            walk_left: [
                {x: 0, y: 54},
                {x: 16, y: 54},
                {x: 32, y: 54},
                {x: 48, y: 54},
            ]
        }), "stand_up", x, y);
        this.scene = scene;
        this.control = control;
        if (this.control instanceof FollowControl)
            this.control.entity = this as Entity<any>;
    }
    tryMove(): boolean {
        // Cache the result of the direction since it is computed each time it is accessed.
        const cdir = this.control.dir;
        if (cdir === undefined)
            return false;
        else {
            let [nx, ny] = toVector(cdir);
            [nx, ny] = [this.x + PlayScene.TILE_SIZE * nx, this.y + PlayScene.TILE_SIZE * ny];
            if (!this.scene.isValidPosition(nx, ny))
                return false;
            [this.x, this.y] = [nx, ny];
            const anim = this.x === nx && this.y === ny ? "walk" : "stand";
            if (this.lastDir !== cdir || !this.animationName.startsWith(anim)) {
                this.animation = `${anim}_${toString(cdir)}`;
                this.lastDir = cdir;
            }
            return true;
        }
    }
    update(dt: number) {
        super.update(dt);
        const cdir = this.control.dir || this.lastDir;
        const scdir = toString(cdir);
        if(!this.animation.endsWith(scdir)) {
            this.animation = `${this.animation.split("_")[0]}_${scdir}`;
        }
    }
    /// Create the default player, using a keyboard control
    static defaultPlayer(scene: PlayScene): Entity<KeyboardControl> {
        return new Entity(scene, new KeyboardControl(), undefined, 2 * PlayScene.TILE_SIZE, 2 * PlayScene.TILE_SIZE);
    }
    /// Create the default enemy
    static defaultEnemy(scene: PlayScene): Entity<FollowControl> {
        return new Entity(scene, new FollowControl(scene), undefined, 10 * PlayScene.TILE_SIZE, 10 * PlayScene.TILE_SIZE);
    }
}
