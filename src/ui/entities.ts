///<reference path='../pixi.d.ts'/>
import PlayScene from "../scene/PlayScene";
import { Room } from "./Map"; 
import { Rectangle } from "../util/geom/Rectangle";
import { BasePoint, Point } from "../util/geom/Point";
import {manhattanDistance} from "../util/math";
import Bits from "../util/ds/Bits";

/// Loaded animations
export interface Animations {
    [index: string]: PIXI.Texture[];
}
/// Animation definitions i.e. represents animations before they are loaded
export interface AnimationsDef {
    [index: string]: {x: number, y: number}[];
}
/// An animated sprite.
export class Dynamic extends PIXI.extras.AnimatedSprite {
    /// Width of each frame in pixels
    readonly frameWidth: number;
    /// Height of each frame in pixels
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
    moveInterval: number;
    private moves: number = 0;

    constructor(scene: PlayScene, source: string = "player", moveInterval: number = 1, x: number = 0, y: number = 0) {
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
        this.moveInterval = moveInterval;
    }
    /// Find the (manhattan) distancce between this and p
    distanceFrom(p: BasePoint) {
        return manhattanDistance(this.x, this.y, p.x, p.y);
    }
    /// Returns the point this entity should try moving to.
    nextPoint(): BasePoint | undefined {
        return undefined;
    }
    /// Try to move this entitiy, by querying its `nextPoint` method.
    ///
    /// This will be called at least once a turn.
    tryMove(): boolean {
        this.moves++;
        if(this.moves < this.moveInterval) 
            return true;
        this.moves -= this.moveInterval;
        const p = this.nextPoint();
        // If the next point is this point i.e. no movement
        if(p == this)
            return true;
        else if(p != undefined && this.scene.canWalk(p.x, p.y)) {
            const x = p.x / PlayScene.TILE_SIZE, y = p.y / PlayScene.TILE_SIZE;
            if(this.room == undefined || !this.room.contains(x, y)) {
                let rooms: Room[] = [];
                this.scene.map.retrieve(rooms, this);
                for(const r of rooms)
                    if(r.contains(x, y))
                        this.room = this.scene.map.grid.rooms[r.index];
            }
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
    private buttons = new Bits(64);
    
    constructor(scene: PlayScene) {
        super(scene);
        scene.addEvent("keydown", (e: KeyboardEvent) => {
            this.buttons.set(e.keyCode);
        });
        scene.addEvent("keyup", (e: KeyboardEvent) => {
            this.buttons.unset(e.keyCode);
        });
    }
    nextPoint(): BasePoint | undefined {
        if(this.buttons.get(37))
            return { x: this.x - PlayScene.TILE_SIZE, y: this.y};
        else if(this.buttons.get(38))
            return { x: this.x, y: this.y - PlayScene.TILE_SIZE};
        else if(this.buttons.get(39))
            return { x: this.x + PlayScene.TILE_SIZE, y: this.y};
        else if(this.buttons.get(40))
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

export class MousePlayer extends Entity {
    /// The cache of the path found using A*
    private path: BasePoint[] = [];
    constructor(scene: PlayScene) {
        super(scene);
        scene.addEvent("mousedown", (e: MouseEvent) => {
            const TS = PlayScene.TILE_SIZE;
            const p = this.scene.fromGlobal(new Point(e.offsetX, e.offsetY));
            const revPath = this.scene.map.grid.findPath(Point.from(this, true, 1/TS), Point.from(p, false, 1/TS));
            this.path = revPath.reverse();
        });
    }
    clearPath() {
        this.path.splice(0);
    }
    nextPoint(): BasePoint | undefined {
        if(this.path.length > 0) {
            return Point.from(this.path.pop()!, true, 16);
        } else
            return undefined;
    }
}
export type Player = KeyboardPlayer | GamepadPlayer | MousePlayer;
export class Enemy extends Entity {
    /// How many steps to cache a path for
    private static readonly MAX_PATH_LENGTH = 4;
    /// The player to follow
    follow: Player | undefined;
    /// The cache of the path found using A*
    private path: BasePoint[] = [];

    private sightDist: number = 6 * PlayScene.TILE_SIZE;
    constructor(scene:PlayScene) {
        super(scene, "zombie", 2)
    }
    clearPath() {
        this.path.splice(0);
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
        else if(this.path.length == 0) {
            // The path from start to finish
            const revPath = this.scene.map.grid.findPath(Point.from(this, true, 1/16), Point.from(f, true, 1/16));
            revPath.splice(Enemy.MAX_PATH_LENGTH);
            this.path = revPath.reverse();
        }
            // order from method: first is start, last is goal
        if(this.path.length > 0) {
            return Point.from(this.path.pop()!, true, 16);
        } else
            return this
    }
}