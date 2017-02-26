import PlayScene from "../scene/PlayScene";
import BasePoint from "../util/geom/BasePoint";
import Rectangle from "../util/geom/Rectangle";
import Point from "../util/geom/Point";
import {manhattanDistance} from "../util/math";

export interface Animations {
    [index: string]: PIXI.Texture[];
}
export interface AnimationsDef {
    [index: string]: {x: number, y: number}[];
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
    constructor(anims: Animations, anim: string, x: number, y: number, frameWidth: number = 16, frameHeight: number = 18) {
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
/// This has a generic implementation that is easy to extend from.
export class Entity extends Dynamic {
    /// The scene instance the entity is attached to.
    readonly scene: PlayScene;
    moved: boolean = false;
    lastPoint: BasePoint;

    room: Rectangle | undefined;

    constructor(scene: PlayScene, source: string = "player", x: number = 0, y: number = 0) {
        // Setup animations
        super(Dynamic.makeAnims(source, 16, 18, {
            stand_up: [ {x: 0, y: 0} ],
            stand_right: [ {x: 0, y: 18} ],
            stand_down: [ {x: 0, y: 36} ],
            stand_left: [ {x: 0, y: 54} ],
            walk_up: [
                {x: 0, y: 0},
                {x: 16, y: 0},
                {x: 32, y: 0}
            ],
            walk_right: [
                {x: 0, y: 18},
                {x: 16, y: 18},
                {x: 32, y: 18}
            ],
            walk_down: [
                {x: 0, y: 36},
                {x: 16, y: 36},
                {x: 32, y: 36}
            ],
            walk_left: [
                {x: 0, y: 54},
                {x: 16, y: 54},
                {x: 32, y: 54}
            ]
        }), "stand_up", x, y);
        this.pivot.set(0, 2);
        this.scene = scene;
        this.lastPoint = new Point(x, y);
    }
    distanceFrom(p: BasePoint) {
        return manhattanDistance(this.x, this.y, p.x, p.y);
    }
    nextPoint(): BasePoint | undefined {
        return undefined;
    }
    tryMove(): boolean {
        const p = this.nextPoint();
        if(p != undefined && p == this)
            return true;
        else if(p != undefined && this.scene.canWalk(p.x, p.y)) {
            const x = p.x / PlayScene.TILE_SIZE, y = p.y / PlayScene.TILE_SIZE;
            if(this.room == undefined || !this.room.contains(x, y))
                for(const r of this.scene.map.grid.rooms)
                    if(r.contains(x, y))
                        this.room = r;
            this.x = p.x;
            this.y = p.y;
            this.moved = true;
            const dy = p.y - this.lastPoint.y, dx = p.x - this.lastPoint.x;
            if(Math.abs(dy) > Math.abs(dx))
                this.animation = 'walk_' + (dy > 0 ? 'down' : 'up');
            else
                this.animation = 'walk_' + (dx > 0 ? 'right' : 'left');
            this.lastPoint = p;
            return true;
        } else {
            if(this.animation.startsWith('walk_'))
                this.animation = this.animation.replace('walk_', 'stand_');
            return false;
        }
    }
}
export class KeyboardPlayer extends Entity {
    private buttons = new Set<number>();
    
    constructor(scene: PlayScene) {
        super(scene);
        window.addEventListener("keydown", (e: KeyboardEvent) => {
            this.buttons.add(e.keyCode);
        });
        window.addEventListener("keyup", (e: KeyboardEvent) => {
            this.buttons.delete(e.keyCode);
        });
    }
    nextPoint(): BasePoint | undefined {
        if(this.buttons.has(37))
            return { x: this.x - PlayScene.TILE_SIZE, y: this.y};
        else if(this.buttons.has(38))
            return { x: this.x, y: this.y - PlayScene.TILE_SIZE};
        else if(this.buttons.has(39))
            return { x: this.x + PlayScene.TILE_SIZE, y: this.y};
        else if(this.buttons.has(40))
            return { x: this.x, y: this.y + PlayScene.TILE_SIZE};
        else return undefined;
    }
}
export class GamepadPlayer extends Entity {
    readonly index: number;
    
    constructor(scene: PlayScene, index: number) {
        super(scene);
        this.index = index;
    }
    nextPoint(): BasePoint | undefined {
        const gp = navigator.getGamepads()[this.index];
        if(gp == null)
            return this;
        const dx = gp.axes[0], dy = gp.axes[1];
        if(dx == 0 && dy == 0)
            return undefined;
        else
            return { x: this.x + Math.round(dx) * PlayScene.TILE_SIZE, y: this.y + Math.round(dy) * PlayScene.TILE_SIZE};
    }
}
export type Player = KeyboardPlayer | GamepadPlayer;
export class Enemy extends Entity {
    /// The player to follow
    follow: Player | undefined;
    /// The cache of the path found using A*
    path: BasePoint[] = [];

    sightDist: number = 5 * PlayScene.TILE_SIZE;
    constructor(scene:PlayScene) {
        super(scene, "zombie")
    }
    startFollowing(e: Player) {
        this.follow = e;
        const text = new PIXI.Text("!", {
            fill: "white"
        });
        text.position.set(this.x - text.width / 2, this.y - text.height);
        let frame: () => void;
        frame = () => {
            text.alpha -= 0.1;
            if(text.alpha <= 0) {
                this.scene.removeNonUi(text);
                this.scene.counter.unregister(frame);
            }
        }
        this.scene.counter.register(0.03, frame);
        this.scene.addNonUi(text);
    }
    canSee(p: Player): boolean {
        return this.distanceFrom(p) < 2 * this.sightDist || (p.room != undefined && this.room == p.room);
    }


    nextPoint(): BasePoint | undefined {
        if(this.follow == undefined)
            return this;
        // The player to follow
        const f = this.follow!;
        // If there is no difference
        if(this.x - f.x == 0 && this.y - f.y == 0)
            return this
        // If the cached path is empty
        else if(this.path.length == 0)
            this.path = this.scene.map.grid.findPath(Point.from(this, true, 1/16), Point.from(f, true, 1/16)).reverse();
        if(this.path.length > 0) {
            return Point.from(this.path.pop()!, true, 16);
        } else
            return undefined
    }
}