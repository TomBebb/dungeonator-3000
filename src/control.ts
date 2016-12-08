import Game from "./Game";
import { Entity } from "./entities";
import { distSquared } from "./math";

/// 2D directions that entities can move in.
export const enum Direction {
    None,
    Left,
    Right,
    Up,
    Down
}
export const enum Button {
    Primary = 0,
    Secondary = 1 << 0,
    Tertiary = 1 << 1
}
/// A source of `Control`.
export interface Control {
    dir: Direction;
    button(_: Button): boolean;
    update(_: number): void;
}
/// The basic implementation of the `Control` interface
export class BasicControl implements Control {
    dir: Direction = Direction.None;
    private buttons: number = 0;
    button(which: Button): boolean {
        return (this.buttons & which) !== 0;
    }
    protected updateButton(button: Button, pressed: boolean): void {
        if (pressed)
            this.buttons |= button;
        else
            this.buttons = (this.buttons | button) ^ button;

    }
    update(_: number): void { }
}
export class FollowControl implements Control {
    public entity: Entity<FollowControl>;
    private game: Game;
    constructor(game: Game) {
        this.game = game;
    }

    button(_: Button): boolean {
        return false;
    }

    get dir(): Direction {
        let nearestEntity: Entity<any> = this.game.entities.filter(x => this.entity != x).reduce((a, b) => {
            if(distSquared(this.entity, a) < distSquared(this.entity, b)) {
                return a;
            } else {
                return b;
            }
        });
        if(nearestEntity) {
            let [dx, dy] = [nearestEntity.x - this.entity.x, nearestEntity.y - this.entity.y];
            if(dx === 0 && dy === 0)
                return Direction.None;
            else if(Math.abs(dx) > Math.abs(dy)) // when the horizontal is bigger
                return dx < 0 ? Direction.Left : Direction.Right;
            else // when the vertical is bigger
                return dy < 0 ? Direction.Up : Direction.Down;
        } else {
            return Direction.None;
        }
    }
    update(_: number): void { }
}
export class GamepadControl implements Control {
    private readonly deadzone: number = 0.1;
    private readonly gamepad: Gamepad;
    constructor(gamepad: Gamepad) {
        this.gamepad = gamepad;
    }
    get index(): number {
        return this.gamepad.index;
    }
    button(which: Button): boolean {
        return this.gamepad.buttons[which].pressed;
    }
    get dir(): Direction {
        const a = this.gamepad.axes;
        const b = this.gamepad.buttons;
        if (b[14].pressed || a[0] < this.deadzone)
            return Direction.Left;
        else if (b[15].pressed || a[0] > 1 - this.deadzone)
            return Direction.Right;
        else if (b[12].pressed || a[1] < this.deadzone)
            return Direction.Up;
        else if (b[13].pressed || a[1] > 1 - this.deadzone)
            return Direction.Down;
        else
            return Direction.None;
    }
    update(_: number): void {
    }
}
export class KeyboardControl extends BasicControl {
    constructor(game: Game) {
        super();
        game.canvas.tabIndex = 1;
        game.canvas.onkeydown = (e: KeyboardEvent) => {
            switch (e.keyCode) {
                case 32:
                    this.updateButton(0, true);
                    break;
                case 18: case 225:
                    this.updateButton(1, true);
                    break;
                case 37:
                    this.dir = Direction.Left;
                    break;
                case 38:
                    this.dir = Direction.Up;
                    break;
                case 39:
                    this.dir = Direction.Right;
                    break;
                case 40:
                    this.dir = Direction.Down;
                    break;
            }
        };
        game.canvas.onkeyup = (e: KeyboardEvent) => {
            if (e.keyCode >= 37 && e.keyCode <= 40)
                this.dir = Direction.None;
            else if (e.keyCode == 32)
                this.updateButton(0, false);
            else if (e.keyCode === 18 || e.keyCode === 225)
                this.updateButton(1, false);
        }
    }
    update(_: number): void {
    }
}
const DIRS: [number, number][] = [
    [0, 0],
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
];
export function toVector(dir: Direction): [number, number] {
    return DIRS[dir];
}
