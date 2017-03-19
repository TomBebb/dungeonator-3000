///<reference path='../pixi.d.ts'/>
import PlayScene from "../scene/PlayScene";
import { Room } from "./Map"; 
import { Rectangle } from "../util/geom/Rectangle";
import { BasePoint, Point } from "../util/geom/Point";
import {manhattanDistance} from "../util/math";
import {Input, FollowInput, MultiInput, KeyboardInput, MouseInput } from "../util/input";
import Item from "./Item";

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
export class Entity<I extends Input> extends Dynamic {
    /// The scene instance the entity is attached to.
    readonly scene: PlayScene;
    moved: boolean = false;
    lastPoint: BasePoint;

    room: Rectangle | undefined;
    moveInterval: number;
    private moves: number = 0;
    input: I;

    constructor(scene: PlayScene, input: I, source: string = "player", moveInterval: number = 1, x: number = 0, y: number = 0) {
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
        this.input = input;
        input.entity = this;
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
        let i = this.input.next();
        if(i == "pause") {
            this.scene.pause();
            return undefined;
        } else
            return i;
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
        const r = p ? {x: p.x, y: p.y, width: 1, height: 1}: undefined;
        // If the next point is this point i.e. no movement
        if(p == this)
            return true;
        else if(p != undefined && this.scene.canWalk(r!)) {
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
            this.lastPoint = p!;
            return true;
        } else {
            if(p != undefined) {
                let items: Item[] = [];
                this.scene.itemQuadTree.retrieve(items, r!);
                let item = items.find((i: Item) => i.x == p.x && i.y == p.y);
                if(item != null)
                    item.interact(this);
            }
            if(this.animation.startsWith('walk_'))
                this.animation = this.animation.replace('walk_', 'stand_');
            return false;
        }
    }
    static defaultPlayer(scene: PlayScene): Entity<MultiInput> {
        return new Entity(scene, new MultiInput(new KeyboardInput(scene), new MouseInput(scene)));
    }
    static newEnemy(scene: PlayScene): Entity<FollowInput> {
        return new Entity(scene, new FollowInput(), "zombie");
    }
}

export default Entity;