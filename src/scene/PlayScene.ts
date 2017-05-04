import Chest from "../ui/Chest";
import Item from "../ui/Item";
import Ladder from "../ui/Ladder";
import UIMap from "../ui/Map";
import Minimap from "../ui/Minimap";
import Entity from "../ui/Entity";
import { GamepadInput, FollowInput } from "../util/input";
import { clamp, randomIn } from "../util/math";
import { BasePoint, Point } from "../util/geom/Point";
import { BaseRectangle, Rectangle } from "../util/geom/Rectangle";
import Counter from "../util/Counter";
import { Save, save, load } from "../util/save";
import Scene from "./Scene";
import PauseScene from "./PauseScene";
import Main from "../main";
import Text = PIXI.Text;

/// Displays a dungeon floor and allows players to interact with it.
export default class PlayScene extends Scene {
    /// The size of a tile, in pixels.
    static readonly TILE_SIZE = 16;
    /// The minimum number of chests to spawn.
    static readonly MIN_CHESTS = 0;
    /// The maximum number of chests to spawn.
    static readonly MAX_CHESTS = 8;
    /// The maximum number of enemies to spawn.
    static readonly MAX_ENEMIES = 20;
    /// The minimum number of enemies to spawn.
    static readonly MIN_ENEMIES = 5;
    /// How many seconds to be forced to wait between turns.
    static readonly TURN_DELAY = 0.1;
    /// The counter to register functions to run every interval.
    readonly counter: Counter = new Counter();
    /// The entities contained in the scene
    readonly enemies: Entity<FollowInput>[] = [];
    /// The players contained in the scene.
    readonly players: Entity<any>[] = [];
    /// All the entities!
    readonly entities: Entity<any>[] = [];
    // Wrap the floor as a property so when it is set it updates the floor label as well.
    private _floor: number;

    set floor(v: number) {
        this._floor = v;
        this.floorLabel.text = `Floor: ${this.floor.toLocaleString(undefined, { minimumIntegerDigits: 3 })}`;
    }
    get floor(): number {
        return this._floor;
    }
    // Wrap the coins as a property so when it is set it updates the coin label as well.
    private _coins: number;

    set coins(v: number) {
        this._coins = v;
        this.coinsLabel.text = `Coins: ${this.coins.toLocaleString(undefined, { minimumIntegerDigits: 6 })}`;
    }
    get coins(): number {
        return this._coins;
    }
    /// Items in this scene.
    readonly items: Item[] = [];
    /// The label that displays the floor number.
    private readonly floorLabel: Text = new Text('', {
        fontFamily: "sans",
        fontSize: 20,
        fill: "white",
        align: "left"
    });
    /// The label that displays the coin count.
    private readonly coinsLabel: Text = new Text('', {
        fontFamily: "sans",
        fontSize: 20,
        fill: "white",
        align: "left"
    });
    /// Whether the game is currently in a turn.
    private inTurn: boolean = false;
    /// A map from gamepad indices to their associated entities.
    private readonly gamepadPlayers = new Map<number, Entity<GamepadInput>>();
    /// The grid as a displayable object.
    readonly map: UIMap;
    /// The mini-map, which displays a miniature version of the dungeon.
    readonly minimap: Minimap;
    /// The pause scene, which is made along with this but not displayed.
    private pauseScene: PauseScene<PlayScene>;
    /// Add an entity
    constructor() {
        super();
        let s = load();
        this.floor = 1;
        if (s != undefined && s.coins)
            this.coins = s.coins;
        else
            this.coins = 0;
        // Set up UI
        this.pauseScene = new PauseScene<PlayScene>(this);
        this.addUi(this.floorLabel);
        this.coinsLabel.x = Main.instance.renderer.width / 2;
        this.addUi(this.coinsLabel);
        const r = Main.instance.renderer;
        // Create a map (a graphical Grid wrapper).
        this.map = new UIMap(128, 128);
        this.addNonUi(this.map);
        const ladder = new Ladder();
        this.addItem(ladder);
        // Make chests
        for (let i = 0; i < PlayScene.MIN_CHESTS; i++)
            this.addItem(new Chest());
        // Make enemies
        for (let i = 0; i < PlayScene.MIN_ENEMIES; i++)
            this.makeEnemy();
        this.counter.register(PlayScene.TURN_DELAY, () => this.startTurn());
        const gamepads: Gamepad[] = navigator.getGamepads() || [];
        // Add player
        this.addEntity(Entity.defaultPlayer(this));
        // Make and setup minimap
        this.minimap = new Minimap(this.map.grid, this.players, ladder);
        this.minimap.position.set(r.width - this.minimap.width - 10, 10);
        this.addUi(this.minimap);
        for (const g of gamepads)
            if (g !== undefined && g !== null)
                this.connectGamepad(g);

    }
    /// Add an entity `e`.
    private addEntity(e: Entity<any>) {
        this.resetEntity(e);
        this.addNonUi(e);
        this.entities.push(e);
        (e.input instanceof FollowInput ? this.enemies : this.players).push(e);
    }
    /// Reset the entity `e`.
    private resetEntity(e: Entity<any>) {
        e.room = this.place(e);
        if (e.input instanceof FollowInput) {
            // Make it not follow anything
            e.input.follow = undefined;
            // Clear its path, so it won't teleport to points along its previous path
            e.input.clearPath();
        }
    }
    /// Reset the item `item`.
    private resetItem(item: Item) {
        this.place(item);
    }
    /// Add the item `item`
    private addItem(item: Item) {
        this.resetItem(item);
        this.items.push(item);
        this.addNonUi(item);
    }
    /// Pause the game.
    pause() {
        // Delete the pause scene cached bitmap as it might have changeed.
        this.pauseScene.cacheAsBitmap = false;
        this.pauseScene.input = this.players[0].input.type;
        this.advance(this.pauseScene, false);
        // Cache the pause scene as a bitmap, as while the game is paused that never changes.
        this.pauseScene.cacheAsBitmap = true;
    }
    /// Make an enemy and add it to the game.
    private makeEnemy(): Entity<FollowInput> {
        const e = Entity.newEnemy(this);
        this.addEntity(e);
        return e;
    }
    /// Advance to the next floor.
    advanceFloor() {
        this.endTurn();
        let saveData: Save | undefined = load();
        const f = ++this.floor;
        if (saveData == undefined)
            saveData = {
                maxFloor: f,
                coins: this.coins
            };
        else
            saveData.coins = this.coins;
        if (f > saveData.maxFloor)
            saveData.maxFloor = f;
        // Increment the floor number
        save(saveData);
        // Reset the map (clear, then generate on it)
        this.map.reset();
        // Re-place items
        for (const i of this.items)
            this.resetItem(i);
        // Add chest if applicable
        if(this.items.length - 1 < Math.min(this._floor, PlayScene.MAX_CHESTS))
            this.addItem(new Chest());
        // Place the entities
        for (const p of this.entities)
            this.resetEntity(p);
        // Add enemy if number of enemies is bigger
        if(this.enemies.length < Math.min(this._floor, PlayScene.MAX_ENEMIES))
            this.addEntity(Entity.newEnemy(this));
        // Redraw the minimap
        this.minimap.redraw();
    }
    /// Runs when a gamepad is connected.
    private connectGamepad(g: Gamepad) {
        // If this gamepad is registered to an entity or is the primary gamepad
        if (this.gamepadPlayers.has(g.index) || g.index == 0)
            return;
        const player: Entity<any> = new Entity(this, new GamepadInput(g.index));
        this.addEntity(player);
        this.placeNear(this.players[0], player);
        this.gamepadPlayers.set(g.index, player);
    }
    /// Check what is at the point `r`
    checkAt(r: BasePoint): Entity<any> | Item | "tile" | undefined {
        // Return true if the underlying map tile is walkable and there aren't any objects at `r`.
        if(this.map.isNotEmpty(r.x, r.y))
            return "tile";
        const item = this.items.find((p) => Point.eq(p, r)); 
        if(item != undefined)
            return item;
        const entity = this.entities.find((p) => p != r && Point.eq(p, r)); 
        if(entity != undefined)
            return entity;
        return undefined;
    }
    /// Attempt to place the rectangle `p` in the game. This assumes
    /// that it has dimensions 1x1.
    place(p: BaseRectangle, numAttempts: number = 5): Rectangle | undefined {
        let r: Rectangle;
        do {
            // Get a random room
            r = randomIn(this.map.grid.rooms)!;
            // Place p in the room
            if (this.placeIn(p, r, numAttempts))
                return r;
        } while (this.checkAt(p) != undefined && --numAttempts > 0)
        return numAttempts > 0 ? r : undefined;
    }
    /// Attempt to place the rectangle `p` in the game. This assumes
    /// that it has dimensions 1x1.
    private placeIn(p: BaseRectangle, r: Rectangle, numAttempts: number = 5): boolean {
        do {
            p.x = (r.x + Math.floor(Math.random() * r.width)) * PlayScene.TILE_SIZE;
            p.y = (r.y + Math.floor(Math.random() * r.height)) * PlayScene.TILE_SIZE;
        } while (this.checkAt(p) != undefined && --numAttempts >= 0)
        return numAttempts < 0;
    }
    /// Attempt to place `t` near `n` - returns true if spawned near player
    private placeNear(t: Entity<any>, n: Entity<any>): boolean {
        const radius = 2;
        for(t.x = n.x - radius; t.x <= n.x + radius; t.x += radius * 2) {
            for(t.y = n.y - radius; t.y <= n.y + radius; t.y += radius * 2) {
                if(this.checkAt(t) == undefined)
                    return true;
            }
        }
        this.place(t);
        return false;
    }
    /// Start a new turn
    startTurn() {
        this.inTurn = true;
    }
    /// End the turn
    endTurn() {
        this.inTurn = false;
        // End the turn
        for (const e of this.enemies)
            e.moved = false;
        for (const e of this.players)
            e.moved = false;
        this.minimap.redraw();
    }
    /// Try moving the entity, return true if it could be moved.
    tryMoveEntity(e: Entity<any>): boolean {
        return e.moved || e.tryMove()
    }
    /// Fil `arr` with the enemies that can see the player.
    private enemiesSeeing(arr: Entity<FollowInput>[], p: Entity<any>) {
        for (const e of this.enemies)
            if (e.input.canSee(p))
                arr.push(e);
    }
    update(dt: number): void {
        this.counter.update(dt);
        const gamepads: Gamepad[] = navigator.getGamepads() || [];
        for (const g of gamepads)
            if (g != undefined && !this.gamepadPlayers.has(g.index))
                this.connectGamepad(g);
        // If it is in a turn
        if (this.inTurn) {
            let enemies: Entity<FollowInput>[] = [];
            let numMoved = 0;
            for (const p of this.players)
                if (this.tryMoveEntity(p)) {
                    enemies.splice(0);
                    this.enemiesSeeing(enemies, p);
                    for (const e of enemies)
                        if (e.input.follow != p)
                            e.input.startFollowing(p);
                    numMoved++;
                }
            for (const e of this.enemies)
                if (this.tryMoveEntity(e))
                    numMoved++;
            if (numMoved == this.enemies.length + this.players.length)
                this.endTurn();
        }
        let tx = 0, ty = 0;
        // Get the first player in entities.
        for (const p of this.players) {
            tx += p.x;
            ty += p.y;
        }
        // Calculate the camera position
        const r = Main.instance.renderer;
        tx /= this.players.length;
        ty /= this.players.length;
        // Lock camera so it can't go off the map.
        tx = clamp(tx, r.width / 2, this.map.width - r.width / 2)
        ty = clamp(ty, r.height / 2, this.map.height - r.height / 2);
        this.setCamera(tx, ty);
    }
}
