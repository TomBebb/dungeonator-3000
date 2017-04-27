///<reference path='../pixi.d.ts'/>
import PlayScene from "../scene/PlayScene";
import { Room } from "./Map";
import { Rectangle } from "../util/geom/Rectangle";
import { BasePoint, Point } from "../util/geom/Point";
import { manhattanDistance } from "../util/math";
import { Input, FollowInput, MultiInput, GamepadInput, KeyboardInput, MouseInput } from "../util/input";
import Item from "./Item";
import AnimatedSprite = PIXI.extras.AnimatedSprite;
import Texture = PIXI.Texture;


/// Loaded animations
export interface Animations {
    [index: string]: Texture[];
}
/// Animation definitions i.e. represents animations before they are loaded
export interface AnimationsDef {
    [index: string]: { x: number, y: number }[];
}
/// An animated sprite.
export class Dynamic extends AnimatedSprite {
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
        for (const anim in anims) {
            const points = anims[anim];
            const textures = points.map((p) => new PIXI.Texture(b, new PIXI.Rectangle(p.x, p.y, fw, fh)));
            a[anim] = textures;
        }
        return a;
    }

}

/// A collectable persistent coin
export class Coin extends Dynamic {
    /// The scene this coin is displayed on.
    scene: PlayScene;
    constructor(scene: PlayScene, x: number, y: number) {
        super(Dynamic.makeAnims("coins", 16, 16, {
            still: [{ x: 0, y: 0 }],
            spin: [{ x: 0, y: 0 }, { x: 16, y: 0 }, { x: 32, y: 0 }, { x: 48, y: 0 }, { x: 64, y: 0 }, { x: 80, y: 0 }, { x: 96, y: 0 }, { x: 111, y: 0 },]
        }), "spin", x, y);
        this.scene = scene;
        this.play();
    }
    update(dt: number) {
        super.update(dt);
        // Move upwards at constant rate.
        this.y -= dt * 0.2;
        // Disappear at constant rate.
        this.alpha -= dt * 0.01;
        // Remove from scene upon disappearing completely.
        if (this.alpha <= 0)
            this.scene.removeNonUi(this);
    }
}

/// A sprite that can move.
///
/// The `I` generic allows any kind of input (say, from a keyboard or mouse) to
/// be used without having to have different entities for different combinations
/// of inputs.
export class Entity<I extends Input> extends Dynamic {
    /// The scene instance the entity is attached to.
    readonly scene: PlayScene;
    moved: boolean = false;
    private lastPoint: BasePoint;

    room: Rectangle | undefined;
    private moveInterval: number;
    private moves: number = 0;
    /// The input, whose `next` method is queried every turn for the next point
    /// to move to.
    input: I;

    constructor(scene: PlayScene, input: I, source: string = "player", moveInterval: number = 1, x: number = 0, y: number = 0) {
        // Setup animations
        super(Dynamic.makeAnims(source, 16, 18, {
            stand_up: [{ x: 0, y: 0 }],
            stand_right: [{ x: 0, y: 18 }],
            stand_down: [{ x: 0, y: 36 }],
            stand_left: [{ x: 0, y: 54 }],
            walk_up: [
                { x: 0, y: 0 },
                { x: 16, y: 0 },
                { x: 32, y: 0 }
            ],
            walk_right: [
                { x: 0, y: 18 },
                { x: 16, y: 18 },
                { x: 32, y: 18 }
            ],
            walk_down: [
                { x: 0, y: 36 },
                { x: 16, y: 36 },
                { x: 32, y: 36 }
            ],
            walk_left: [
                { x: 0, y: 54 },
                { x: 16, y: 54 },
                { x: 32, y: 54 }
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
    distanceFrom(p: BasePoint): number {
        return manhattanDistance(this.x, this.y, p.x, p.y);
    }
    /// Returns the point this entity should move to.
    private nextPoint(): BasePoint | undefined {
        let i = this.input.next();
        if (i == "pause") {
            this.scene.pause();
            return undefined;
        } else
            return i;
    }
    isEnemy(): boolean {
        return this.input instanceof FollowInput;
    }
    /// Try to move this entitiy, by querying the input's `next` method.
    ///
    /// This will be called at least once a turn.
    tryMove(): boolean {
        this.moves++;
        if (this.moves < this.moveInterval)
            return true;
        this.moves -= this.moveInterval;
        const p: BasePoint | undefined = this.nextPoint();
        if ((p == undefined || p == this) && this.animation.startsWith('walk_'))
            this.animation = this.animation.replace('walk_', 'stand_');
        // If there is no movement
        if (p == undefined)
            return false;
        if (p == this)
            return true;
        // Copy the x, y values of this
        const last = this.lastPoint;
        // Move to new values
        this.x = p.x;
        this.y = p.y;
        const interaction = this.scene.checkAt(this);
        // If this bumped into an entity
        if(this.isEnemy() && interaction != undefined && interaction instanceof Entity && !interaction.isEnemy()) {
            const entity: Entity<any> = interaction;
            this.scene.place(entity);
        }
        // If this point is unwalkable
        else if (interaction != undefined) {
            // Find items at this point
            const item = (interaction instanceof Item) ? interaction : null;
            // Return to old position
            this.x = last.x;
            this.y = last.y;
            if (item != null)
                item.interact(this);
            return false;
        }
        // If the entity isn't marked as in a room or the current room doesn't contain it
        if (this.room == undefined || !this.room.contains(this.x, this.y)) {
            // Retrieve rooms this might be in.
            const rooms: Room[] = this.scene.map.quadTree.retrieve(this);
            // Set this room as the first room found containing this.
            this.room = rooms.find((room) => room.intersects(this, 0));
        }
        // Mark as moved
        this.moved = true;
        // Calculate change in co-ordinates.
        const dy = this.y - last.y, dx = this.x - last.x;
        // Set animation appropriately.
        if (Math.abs(dy) > Math.abs(dx))
            this.animation = 'walk_' + (dy > 0 ? 'down' : 'up');
        else
            this.animation = 'walk_' + (dx > 0 ? 'right' : 'left');
        this.lastPoint = p;
        return true;
    }
    /// Create the default player in `scene`
    static defaultPlayer(scene: PlayScene): Entity<MultiInput> {
        return new Entity(scene, new MultiInput(new KeyboardInput(scene), new MouseInput(scene), new GamepadInput(0)));
    }
    /// Create an enemy in `scene`.
    static newEnemy(scene: PlayScene): Entity<FollowInput> {
        return new Entity(scene, new FollowInput(), "zombie");
    }
}

export default Entity;