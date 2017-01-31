import PlayScene from "./scene/PlayScene";
import { Entity } from "./ui/entities";
import Bits from "./util/Bits";
import { BasePoint } from "./util/math";

/// 2D directions that entities can move in.
export const enum Direction {
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
    /// The direction the entity should move in, or undefined if it shouldn't move.
    dir: Direction | undefined;
    /// Check if any buttons are being pressed.
    button(_: Button): boolean;
}
export class FollowControl implements Control {
    /// How many steps should be taken before re-calculating a path.
    private static readonly STEPS_VALID: number = 4;
    //private static readonly FOLLOW_PROXIMITY: number = 12;
    public entity: Entity<FollowControl>;
    private scene: PlayScene;
    lastPath: Direction[] = [];
    follow: Entity<any> | undefined;
    constructor(scene: PlayScene, follow?: Entity<any>) {
        this.scene = scene;
        this.follow = follow;
    }

    button(_: Button): boolean {
        return false;
    }
    /// Transverse an array of points as a path, returning each direction.
    private static toDirs(points: BasePoint[]): Direction[] {
        let l:BasePoint, r: BasePoint;
        let dx:number, dy:number;
        const dirs: Direction[] = [];
        for(let i = 0; i < points.length - 1; i++) {
            l = points[i];
            r = points[i + 1];
            [dx, dy] = [r.x - l.x, r.y - l.y];
            if (dx === 0 && dy === 0) // when there is no change.
                break;
            else if (Math.abs(dx) > Math.abs(dy)) // when the horizontal is bigger
                dirs.push(dx < 0 ? Direction.Left : Direction.Right);
            else // when the vertical is bigger
                dirs.push(dy < 0 ? Direction.Up : Direction.Down);
        }
        return dirs;
    }

    get dir(): Direction | undefined {
        if(this.follow !== undefined && this.lastPath.length === 0) {
            this.lastPath = FollowControl.toDirs(this.scene.map.grid.findPath(FollowControl.map(this.entity), FollowControl.map(this.follow)));
            this.lastPath.splice(0, this.lastPath.length - FollowControl.STEPS_VALID);
        };
        if (this.follow !== undefined && this.lastPath.length > 0) {
            return this.lastPath.pop()!;
        } else
            return undefined;
    }
    static map(p: BasePoint): BasePoint {
        return {
            x: p.x / PlayScene.TILE_SIZE,
            y: p.y / PlayScene.TILE_SIZE
        }
    }
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
    get dir(): Direction | undefined {
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
            return undefined;
    }
}
export class KeyboardControl implements Control {
    _dir: Set<Direction> = new Set();
    keys: Bits = new Bits(4);
    constructor() {
        window.addEventListener("keydown", (e: KeyboardEvent) => {
            if(e.keyCode === 32)
                this.keys.set(Button.Primary);
            else {
                const d = fromKey(e.keyCode);
                if(d !== undefined)
                    this._dir.add(d);
            }
        });
        window.addEventListener("keyup", (e: KeyboardEvent) => {
            if(e.keyCode === 32)
                this.keys.unset(Button.Primary);
            else {
                const d = fromKey(e.keyCode);
                if(d !== undefined)
                    this._dir.delete(d);
            }
        });
    }

    get dir(): Direction | undefined {
        const iter = this._dir.entries().next();
        return iter.value == undefined ? undefined : iter.value[0];
    }

    button(b: Button): boolean {
        return this.keys.get(b);
    }

}
const DIRS: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
];
export function toVector(dir: Direction): [number, number] {
    return DIRS[dir];
}
export function fromKey(key: number): Direction | undefined {
    switch (key) {
        case 37:
            return Direction.Left;
        case 38:
            return Direction.Up;
        case 39:
            return Direction.Right;
        case 40:
            return Direction.Down;
        default: return undefined;
    }
}
export function toString(dir: Direction): string {
    switch (dir) {
        case Direction.Down:
            return "down";
        case Direction.Up:
            return "up";
        case Direction.Left:
            return "left";
        case Direction.Right:
            return "right";
    }
}