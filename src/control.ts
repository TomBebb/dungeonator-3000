import PlayScene from "./scene/PlayScene";
import { Entity } from "./ui/entities";
import { Point, distSquared } from "./util/math";
import Main from "./main";

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
    public entity: Entity<FollowControl>;
    private scene: PlayScene;
    lastPath: Point[] = [];
    path: Promise<Point[]> | undefined = undefined;
    constructor(scene: PlayScene) {
        this.scene = scene;
    }

    button(_: Button): boolean {
        return false;
    }

    get dir(): Direction | undefined {
        const nearestEntity: Entity<any> = this.scene.entities.filter(x => this.entity !== x).reduce((a, b) => {
            if (distSquared(this.entity, a) < distSquared(this.entity, b)) {
                return a;
            } else {
                return b;
            }
        });
        this.lastPath = [];
        if(this.path === undefined) {
            this.path = new Promise((resolve, _) => {
                const r = this.scene.map.grid.search(this.entity, nearestEntity);
                resolve(r);
            });
            this.path.then(console.log);
            this.path.then((path:Point[]) => {
                this.lastPath = path;
                this.path = undefined;
            });
        };
        if (nearestEntity && this.lastPath.length > 0) {

            let [dx, dy] = [this.lastPath[0].x - this.entity.x, this.lastPath[0].y - this.entity.y];
            if (dx === 0 && dy === 0) // when there is no change.
                return undefined;
            else if (Math.abs(dx) > Math.abs(dy)) // when the horizontal is bigger
                return dx < 0 ? Direction.Left : Direction.Right;
            else // when the vertical is bigger
                return dy < 0 ? Direction.Up : Direction.Down;
        } else
            return undefined;
    }
}
export class GamepadControl implements Control {
    private readonly deadzone: number = 0.1;
    private readonly gamepad: Gamepad;
    constructor(gamepad: Gamepad) {
        this.gamepad = gamepad;
        console.log(gamepad);
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
        for(let i = 0; i < b.length; i++)
            if(b[i].pressed)
                console.log(i);
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
    down: number[] = [];
    constructor() {
        const c = Main.instance.renderer.view;
        window.addEventListener("keydown", (e: KeyboardEvent) => this.down.push(e.keyCode), true);
        window.addEventListener("keyup", (e: KeyboardEvent) => {
            const i = this.down.indexOf(e.keyCode);
            if(i >= 0)
                this.down.splice(i);
        }, true);
    }

    get dir(): Direction | undefined {
        for(const key of this.down) {
            const dir = fromKey(key);
            if (dir !== undefined)
                return dir;
        }
        return undefined;
    }

    button(b: Button): boolean {
        if (b === Button.Primary)
            return this.down.indexOf(32) >= 0;
        else return false;
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