import { BasePoint, Point } from "./geom/Point";
import Scene from "../scene/Scene";
import PlayScene from "../scene/PlayScene";
import { Entity } from "../ui/entities";

type Event = BasePoint | "pause" | undefined;

/// Any source of input
export interface Input {
	entity: Entity<any>;
	/// Query for the next point from this input source
	next(): Event;
}

/// Takes multiple input sources
export class MultiInput implements Input {
	private _entity: Entity<any>;
	get entity(): Entity<any> {
		return this._entity;
	}
	set entity(e: Entity<any>) {
		this._entity = e;
		for(const i of this.inputs)
			i.entity = e;
	}
	inputs: Input[];
	constructor(...inputs: Input[]) {
		this.inputs = inputs;
	}
	next(): Event {
		for(const i of this.inputs) {
			const v = i.next();
			if(v != undefined)
				return v;
		}
		return undefined;
	}
}

/// Input from a keyboard
export class KeyboardInput implements Input {
    private buttons = new Set<number>();

    entity: Entity<any>;
    
    constructor(scene: Scene) {
        scene.addEvent("keydown", (e: KeyboardEvent) => this.buttons.add(e.keyCode));
        scene.addEvent("keyup", (e: KeyboardEvent) => this.buttons.delete(e.keyCode));
    }
    next(): Event {
    	const x = this.entity.x, y = this.entity.y, TS = PlayScene.TILE_SIZE;
    	if(this.buttons.has(13) || this.buttons.has(32) || this.buttons.has(27))
    		return "pause";
        else if(this.buttons.has(37))
            return { x: x - TS, y: y};
        else if(this.buttons.has(38))
            return { x: x, y: y - TS};
        else if(this.buttons.has(39))
            return { x: x + TS, y: y};
        else if(this.buttons.has(40))
            return { x: x, y: y + TS};
        else return undefined;
    }
}

export class MouseInput implements Input {
	entity: Entity<any>;
    /// The cache of the path found using A*
    private path: BasePoint[] = [];
    constructor(scene: PlayScene) {
        scene.addEvent("mousedown", (e: MouseEvent) => {
            const TS = PlayScene.TILE_SIZE;
            const p = scene.fromGlobal(new Point(e.offsetX, e.offsetY));
            const revPath = scene.map.grid.findPath(Point.from(this.entity, true, 1/TS), Point.from(p, false, 1/TS));
            this.path = revPath.reverse();
        });
    }
    clearPath() {
        this.path.splice(0);
    }
    next(): Event {
        if(this.path.length > 0) {
            return Point.from(this.path.pop()!, true, 16);
        } else
            return undefined;
    }
}
export class FollowInput implements Input {
    /// How many steps to cache a path for
    private static readonly MAX_PATH_LENGTH = 4;
    /// The entity to follow (usually the player)
    follow: Entity<any> | undefined;
    /// The cache of the path found using A*
    private path: BasePoint[] = [];

    private sightDist: number = 6 * PlayScene.TILE_SIZE;

    entity: Entity<any>;

    clearPath() {
        this.path.splice(0);
    }
    startFollowing(e: Entity<any>) {
        this.follow = e;
        const x = this.entity.x, y = this.entity.y;
        const text = new PIXI.Text("!", {
            fill: "white"
        });
        text.position.set(x - text.width / 2, y - text.height);
        let frame: () => void;
        const scene = this.entity.scene;
        frame = () => {
            text.alpha -= 0.1;
            if(text.alpha <= 0) {
                scene.removeNonUi(text);
                scene.counter.unregister(frame);
            }
        }
        scene.counter.register(0.03, frame);
        scene.addNonUi(text);
    }
    canSee(p: Entity<any>): boolean {
        return p.distanceFrom(this.entity) < 2 * this.sightDist || (p.room != undefined && this.entity.room == p.room);
    }


    next(): Event {
        if(this.follow == undefined)
            return this.entity;
        // The entity to follow
        const f = this.follow!, x = this.entity.x, y = this.entity.y, scene = this.entity.scene;
        // If there is no difference
        if(x - f.x == 0 && y - f.y == 0)
            return this.entity;
        // If the cached path is empty
        else if(this.path.length == 0) {
            // The path from start to finish
            const revPath = scene.map.grid.findPath(Point.from(this.entity, true, 1/16), Point.from(f, true, 1/16));
            revPath.splice(FollowInput.MAX_PATH_LENGTH);
            this.path = revPath.reverse();
        }
            // order from method: first is start, last is goal
        if(this.path.length > 0) {
            return Point.from(this.path.pop()!, true, 16);
        } else
            return this.entity;
    }
}
export class GamepadInput implements Input {
    readonly index: number;

    entity: Entity<any>;
    
    constructor(index: number = 0) {
        this.index = index;
    }
    next(): Event {
        const gp = navigator.getGamepads()[this.index];
        if(gp == null)
            return this.entity;
        if(gp.buttons[9].pressed)
            return "pause";
        const x = this.entity.x, y = this.entity.y, dx = gp.axes[0], dy = gp.axes[1], TS = PlayScene.TILE_SIZE;
        if(dx == 0 && dy == 0)
            return undefined;
        else
            return { x: x + Math.round(dx) * TS, y: y + Math.round(dy) * TS};
    }
}
export default Input;