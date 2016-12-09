import { KeyboardControl, FollowControl, Control, toVector } from "./control";
import Game from "./Game";
import { Point } from "./math";

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

/// A sprite that can move.
///
/// This uses generics to make it able to use any control (such as gamepad or chase).
export class Entity<C extends Control> extends Sprite {
    /// The delay between moves of the entity, in seconds
    readonly delay: number;
    /// The source of input that controls this entity.
    readonly control: C;
    /// The game instance the entity is attached to.
    readonly game: Game;
    /// The spritesheet this will use
    readonly spritesheet: HTMLImageElement;
    /// offset in the spritesheet
    readonly offset: Point;
    /// The number of seconds since the last movement of the entity.
    sinceLast: number = 0;

    constructor(game: Game, control: C, delay: number = 0.5, x: number = 0, y: number = 0, offsetX: number, offsetY: number) {
        super(x, y);
        this.delay = delay;
        this.game = game;
        this.control = control;
        if(this.control instanceof FollowControl)
            this.control.entity = this as Entity<any>;
    }

    update(dt: number): void {
        this.sinceLast += dt;
        if(this.sinceLast > this.delay) {
            // Compute the next position
            let [dx, dy] = toVector(this.control.dir);
            this.sinceLast -= this.delay;
            let [nx, ny] = [this.x + dx, this.y + dy];
            // Check if the computed next position is valid
            if(this.game.isValidPosition(nx, ny))
                [this.x, this.y] = [nx, ny];
        }
    }

    draw(c: CanvasRenderingContext2D): void {
      const { x: ox, y: oy } = this.offset;
      c.drawImage(this.spritesheet, ox, oy, Game.TILE_SIZE, Game.TILE_SIZE, this.x * Game.TILE_SIZE, this.y * Game.TILE_SIZE);
    }
    /// Create the default player, using a keyboard control
    static defaultPlayer(game: Game): Entity<KeyboardControl> {
        return new Entity(game, new KeyboardControl(game), 0.5, 1, 1, "green");
    }
    /// Create the default enemy
    static defaultEnemy(game: Game): Entity<FollowControl> {
        return new Entity(game, new FollowControl(game), 1.0, 10, 10, "red");
    }
}
