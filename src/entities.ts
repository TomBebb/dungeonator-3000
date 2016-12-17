import { toString, Direction, KeyboardControl, FollowControl, Control, toVector } from "./control";
import Game from "./Game";
import { Point } from "./util/math";
import Assets from "./util/Assets";

/// An object that has a physical position and can be drawn to the screen.
export abstract class Sprite {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    /// Draw the sprite to the screen.
    abstract draw(c: CanvasRenderingContext2D): void;
    /// Update the sprite with a delta (in seconds).
    update(_: number) {}
}

/// An animated sprite.
export class Dynamic extends Sprite {
    readonly source: HTMLImageElement;
    readonly frameWidth: number;
    readonly frameHeight: number;
    readonly delay: number = 0.3;
    private sinceLast: number = 0;
    readonly animations: Map<string, Point[]>;
    frame: number = 0;
    private _animation: Point[];
    protected animationName: string;
    get animation() {
        return this.animationName;
    }
    set animation(n: string) {
        this.animationName = n;
        this._animation = this.animations.get(n)!;
        this.frame = 0;
        this.sinceLast = 0;
    }
    constructor(source: HTMLImageElement, x: number, y: number, animations: Map<string, Point[]> = new Map(), frameWidth: number = 16, frameHeight: number = 18) {
        super(x, y);
        this.animations = animations;
        this.source = source;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
    }
    draw(c: CanvasRenderingContext2D) {
        const f = this._animation[this.frame];
        c.drawImage(this.source, f.x, f.y, this.frameWidth, this.frameHeight, this.x * Game.TILE_SIZE, this.y * Game.TILE_SIZE, this.frameWidth, this.frameHeight);
    }
    update(dt: number) {
        this.sinceLast += dt;
        if(this.sinceLast >= this.delay) {
            this.sinceLast -= this.delay;
            this.frame += 1;
            if(this.frame >= this._animation.length)
                this.frame = 0;
        }
    }
}

/// A sprite that can move.
///
/// This uses generics to make it able to use any control (such as gamepad or chase).
export class Entity<C extends Control> extends Dynamic {
    /// The source of input that controls this entity.
    readonly control: C;
    /// The game instance the entity is attached to.
    readonly game: Game;
    private lastDir: Direction;

    constructor(game: Game, control: C, assets: Assets, sprite: string = "player.png", x: number = 0, y: number = 0) {
        super(assets.getImage(sprite)!, x, y);
        // Register animations from the sprite sheet.
        this.animations.set("walk_up", [
            {x: 0, y: 0},
            {x: 16, y: 0},
            {x: 32, y: 0},
            {x: 48, y: 0},
        ]);
        this.animations.set("stand_up", [ {x: 0, y: 0} ]);
        this.animations.set("stand_right", [ {x: 0, y: 18} ]);
        this.animations.set("stand_down", [ {x: 0, y: 36} ]);
        this.animations.set("stand_left", [ {x: 0, y: 54} ]);
        this.animations.set("walk_right", [
            {x: 0, y: 18},
            {x: 16, y: 18},
            {x: 32, y: 18},
            {x: 48, y: 18},
        ]);
        this.animations.set("walk_down", [
            {x: 0, y: 36},
            {x: 16, y: 36},
            {x: 32, y: 36},
            {x: 48, y: 36},
        ]);
        this.animations.set("walk_left", [
            {x: 0, y: 54},
            {x: 16, y: 54},
            {x: 32, y: 54},
            {x: 48, y: 54},
        ]);
        this.lastDir = Direction.None;
        this.animation = "walk_up";
        this.game = game;
        this.control = control;
        if(this.control instanceof FollowControl)
            this.control.entity = this as Entity<any>;
    }
    // Plan the entity's movement in the next step.
    plan(): Point[] {
        // Cache the result of the direction since it is computed each time it is accessed.
        const cdir = this.control.dir;
        // Compute the next position
        let [dx, dy] = toVector(cdir);
        let [nx, ny] = [this.x + dx, this.y + dy];
        // Check if the computed next position is valid
        if(this.game.isValidPosition(nx, ny))
            return [{
                x: nx,
                y: ny
            }];
        else
            return [];
    }
    step(): void {
        // Cache the result of the direction since it is computed each time it is accessed.
        const cdir = this.control.dir;
        // Compute the next position
        let [dx, dy] = toVector(cdir);
        let [nx, ny] = [this.x + dx, this.y + dy];
        // Check if the computed next position is valid
        if(this.game.isValidPosition(nx, ny))
            [this.x, this.y] = [nx, ny];
        const anim = dx != 0 || dy != 0 ? 'walk' : 'stand';
        if(this.lastDir !== cdir || !this.animationName.startsWith(anim))
            this.animation = `${anim}_${toString(cdir)}`;
        this.lastDir = cdir;
    }
    /// Create the default player, using a keyboard control
    static defaultPlayer(game: Game, assets: Assets): Entity<KeyboardControl> {
        return new Entity(game, new KeyboardControl(game), assets, undefined, 2, 2);
    }
    /// Create the default enemy
    static defaultEnemy(game: Game, assets: Assets): Entity<FollowControl> {
        return new Entity(game, new FollowControl(game), assets, undefined, 10, 10);
    }
}
