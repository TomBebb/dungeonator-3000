import { BasePoint, Point } from "./geom/Point";
import Scene from "../scene/Scene";
import PlayScene from "../scene/PlayScene";
import Entity from "../ui/Entity";

/// An event that an input is polled for.
///
/// If the input was used this is a point with the next point.
/// If the input was used to pause the game, "pause" is yielded
/// If the input wasn't used, this is undefined.
export type Event = BasePoint | "pause" | undefined;


/// Represents a type of input source.
export type InputType = "mouse" | "keyboard" | "gamepad" | undefined;

/// Any source of input.
export interface Input {
    /// The type of input this is using
    type: InputType;
    /// The entity that this input acts on.
    entity: Entity<any>;
    /// Return the next `Event` from this input source 
    next(): Event;
}

/// Takes multiple input sources, used for multiple primary player inputs.
export class MultiInput implements Input {
    /// The underlying entity
    private _entity: Entity<any>;
    get entity(): Entity<any> {
        return this._entity;
    }
    // When a new entity is set...
    set entity(e: Entity<any>) {
        this._entity = e;
        // Register the entity for all the inner inputs
        for (const i of this.inputs)
            i.entity = e;
    }
    get type() {
        return this.lastInput.type;
    }
    /// The last input to emit an `Event`.
    private lastInput: Input;
    /// The list of inputs.
    private inputs: Input[];
    constructor(...inputs: Input[]) {
        this.inputs = inputs;
        this.lastInput = inputs[0];
    }
    next(): Event {
        // For every input...
        for (const i of this.inputs) {
            // Poll it for events
            const v: Event = i.next();
            // If it is to pause or move the entity...
            if (v == "pause" || v != undefined) {
                this.lastInput = i;
                return v;
            }
        }
        return undefined;
    }
}

/// Input from a keyboard
export class KeyboardInput implements Input {
    /// The currently held down buttons, as a set of their key codes.
    private buttons = new Set<number>();
    readonly type: InputType = "keyboard";
    entity: Entity<any>;

    constructor(scene: Scene) {
        // Register keyboard events
        scene.addEvent("keydown", (e: KeyboardEvent) => {
            if (!e.repeat)
                this.buttons.add(e.keyCode)
        });
        scene.addEvent("keyup", (e: KeyboardEvent) => {
            if (!e.repeat)
                this.buttons.delete(e.keyCode)
        });
    }
    next(): Event {
        const x = this.entity.x, y = this.entity.y, TS = PlayScene.TILE_SIZE;
        // If enter or space is pressed
        if (this.buttons.has(13) || this.buttons.has(32) || this.buttons.has(27))
            return "pause";
        // If the left arrow key is pressed
        else if (this.buttons.has(37))
            return { x: x - TS, y: y };
        // If the up arrow key is pressed
        else if (this.buttons.has(38))
            return { x: x, y: y - TS };
        // If the right arrow key is pressed
        else if (this.buttons.has(39))
            return { x: x + TS, y: y };
        // If the down arrow key is pressed
        else if (this.buttons.has(40))
            return { x: x, y: y + TS };
        else return undefined;
    }
}

/// Input using a mouse
export class MouseInput implements Input {
    entity: Entity<any>;
    readonly type: InputType = "mouse";
    /// The cache of the path found using A*
    private path: BasePoint[] = [];
    constructor(scene: PlayScene) {
        // Register events
        scene.addEvent("mousedown", (e: MouseEvent) => {
            const TS = PlayScene.TILE_SIZE;
            const p = scene.fromGlobal(new Point(e.offsetX, e.offsetY));
            const revPath = scene.map.grid.findPath(Point.from(this.entity, true, 1 / TS), Point.from(p, false, 1 / TS));
            this.path = revPath.reverse();
        });
    }
    /// Clear this input's path.
    clearPath() {
        this.path.splice(0);
    }
    next(): Event {
        if (this.path.length > 0) {
            return Point.from(this.path.pop()!, true, 16);
        } else
            return undefined;
    }
}
export class FollowInput implements Input {
    readonly type: InputType = undefined;
    /// How many steps to cache a path for
    private static readonly MAX_PATH_LENGTH = 4;
    /// The entity to follow (usually the player)
    follow: Entity<any> | undefined;
    /// The cache of the path found using A*
    private path: BasePoint[] = [];

    /// How many tiles away a player must be for this to follow them.
    private sightDist: number = 6 * PlayScene.TILE_SIZE;

    entity: Entity<any>;

    /// Clear the cached path.
    clearPath() {
        this.path.splice(0);
    }
    /// Start following an entity
    startFollowing(e: Entity<any>) {
        this.follow = e;
        const x = this.entity.x, y = this.entity.y;
        // Set up text
        const text = new PIXI.Text("!", {
            fill: "white"
        });
        text.position.set(x - text.width / 2, y - text.height);
        let frame: () => void;
        const scene = this.entity.scene;
        frame = () => {
            text.alpha -= 0.1;
            if (text.alpha <= 0) {
                scene.removeNonUi(text);
                scene.counter.unregister(frame);
            }
        }
        scene.counter.register(0.03, frame);
        scene.addNonUi(text);
    }
    /// Return true if `entity` can 'see' `p`.
    canSee(p: Entity<any>): boolean {
        return p.distanceFrom(this.entity) < 2 * this.sightDist || (p.room != undefined && this.entity.room == p.room);
    }


    next(): Event {
        if (this.follow == undefined)
            return this.entity;
        // The entity to follow
        const f = this.follow!, x = this.entity.x, y = this.entity.y, scene = this.entity.scene;
        // If there is no difference
        if (x - f.x == 0 && y - f.y == 0)
            return this.entity;
        // If the cached path is empty
        else if (this.path.length == 0) {
            // The path from start to finish
            const revPath = scene.map.grid.findPath(Point.from(this.entity, true, 1 / 16), Point.from(f, true, 1 / 16));
            revPath.splice(FollowInput.MAX_PATH_LENGTH);
            this.path = revPath.reverse();
        }
        // order from method: first is start, last is goal
        if (this.path.length > 0) {
            return Point.from(this.path.pop()!, true, 16);
        } else
            return this.entity;
    }
}
/// Input from a gamepad.
export class GamepadInput implements Input {
    readonly type: InputType = "gamepad";
    readonly index: number;

    entity: Entity<any>;

    constructor(index: number = 0) {
        this.index = index;
    }
    next(): Event {
        // Get the relevant gamepad.
        const gp = navigator.getGamepads()[this.index];
        // If the gamepad has disconnected, or was invalid.
        if (gp == null)
            return undefined;
        // If start button is pressed.
        if (gp.buttons[9].pressed)
            return "pause";
        // Store axis values and entity position.
        const x = this.entity.x, y = this.entity.y, dx = gp.axes[0], dy = gp.axes[1], TS = PlayScene.TILE_SIZE;
        if (dx == 0 && dy == 0)
            return undefined;
        else
            // Calculate next point
            return { x: x + Math.round(dx) * TS, y: y + Math.round(dy) * TS };
    }
}
export default Input;