import Chest from "../ui/Chest";
import Item from "../ui/Item";
import Ladder from "../ui/Ladder";
import UIMap from "../ui/Map";
import Minimap from "../ui/Minimap";
import Entity from "../ui/entities";
import { GamepadInput, FollowInput } from "../util/input";
import { clamp, randomIn } from "../util/math";
import { BaseRectangle, Rectangle } from "../util/geom/Rectangle";
import Counter from "../util/Counter";
import QuadTree from "../util/geom/QuadTree";
import { Save, save, load } from "../util/save";
import Scene from "./Scene";
import PauseScene from "./PauseScene";
import Main from "../main";
import Sprite = PIXI.Sprite;
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
    /// The players, where each set bit is an index into `entities`.
    readonly players: Entity<any>[] = [];
    // Wrap the floor as a property so when it is set it updates the floor label as well.
    private _floor: number;

    set floor(v: number) {
        this._floor = v;
        this.floorLabel.cacheAsBitmap = false;
        this.floorLabel.text = `Floor: ${this.floor.toLocaleString(undefined, { minimumIntegerDigits: 3 })}`;
        this.floorLabel.cacheAsBitmap = true;
    }
    get floor(): number {
        return this._floor;
    }
    // Wrap the coins as a property so when it is set it updates the coin label as well.
    private _coins: number;

    set coins(v: number) {
        this._coins = v;
        this.coinsLabel.cacheAsBitmap = false;
        this.coinsLabel.text = `Coins: ${this.coins.toLocaleString(undefined, { minimumIntegerDigits: 6 })}`;
        this.coinsLabel.cacheAsBitmap = true;
    }
    get coins(): number {
        return this._coins;
    }
    /// Items in this scene.
    private items: Item[] = [];
    /// The quad tree that items such as chests are stored on.
    itemQuadTree: QuadTree<Item>;
    /// The quad tree that any collidable object (including entities and items) is stored on.
    private quadTree: QuadTree<Sprite>;
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
        const bounds = new Rectangle(0, 0, this.map.width, this.map.height);
        // Make quad tree for all collidable objects
        this.quadTree = new QuadTree<Sprite>(bounds);
        // Make quad tree for items
        this.itemQuadTree = new QuadTree<Item>(bounds);
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
        let player: Entity<any> = Entity.defaultPlayer(this);
        this.addEntity(player);
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
        (e.input instanceof FollowInput ? this.enemies : this.players).push(e);
    }
    /// Reset the entity `e`.
    private resetEntity(e: Entity<any>) {
        this.quadTree.insert(e);
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
        this.itemQuadTree.insert(item);
        this.quadTree.insert(item);
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
        // Clear quad trees
        this.quadTree.clear();
        this.itemQuadTree.clear();
        // Re-place items
        for (const i of this.items)
            this.resetItem(i);
        // Add chest if applicable
        if(this.items.length - 1 < Math.min(this._floor, PlayScene.MAX_CHESTS))
            this.addItem(new Chest());
        // Place the entities
        for (const p of this.players)
            this.resetEntity(p);
        for (const e of this.enemies)
            this.resetEntity(e);
        // Add enemy if number of enemies is 
        if(this.enemies.length < Math.min(this._floor, PlayScene.MAX_ENEMIES))
            this.addEntity(Entity.newEnemy(this));
        // Redraw the minimap
        this.minimap.redraw();
    }
    /// Runs when a gamepad is connected.
    private connectGamepad(g: Gamepad) {
        if (this.gamepadPlayers.has(g.index))
            return;
        const player: Entity<any> = new Entity(this, new GamepadInput(g.index));
        this.addEntity(player);
        this.placeNear(this.players[0], player);
    }
    /// Check if the tile under `r` is walkable
    canWalk(r: BaseRectangle): boolean {
        const a = this.quadTree.retrieve(r);
        if (a.length > 0 && r instanceof Entity)
            console.log(r, a);
        return this.map.canWalk(r.x, r.y) && a.find((q) => r.x == q.x && r.y == q.y) == undefined;
    }
    /// Check if the tile under `r` is clear of anything
    isNotEmpty(r: BaseRectangle): boolean {
        return this.map.isNotEmpty(r.x, r.y) || this.quadTree.retrieve(r).find((q) => r.x == q.x && r.y == q.y) != undefined;
    }
    /// Attempt to place the rectangle `p` in the game. This assumes
    /// that it has dimensions 1x1.
    private place(p: BaseRectangle, numAttempts: number = 5): Rectangle | undefined {
        let r: Rectangle;
        do {
            // Get a random room
            r = randomIn(this.map.grid.rooms)!;
            // Place p in the room
            if (this.placeIn(p, r, numAttempts))
                return r;
        } while (this.isNotEmpty(p) && --numAttempts > 0)
        return numAttempts > 0 ? r : undefined;
    }
    /// Attempt to place the rectangle `p` in the game. This assumes
    /// that it has dimensions 1x1.
    private placeIn(p: BaseRectangle, r: Rectangle, numAttempts: number = 5): boolean {
        do {
            p.x = (r.x + Math.floor(Math.random() * r.width)) * PlayScene.TILE_SIZE;
            p.y = (r.y + Math.floor(Math.random() * r.height)) * PlayScene.TILE_SIZE;
        } while (this.isNotEmpty(p) && --numAttempts >= 0)
        return numAttempts < 0;
    }
    /// Attempt to place `t` near `t`
    private placeNear(t: Entity<any>, n: Entity<any>, numAttempts: number = 5): boolean {
        if (n.room != null) {
            const origNumAttempts = numAttempts;
            while (numAttempts-- > 0) {
                const r = randomIn(this.map.grid.rooms);
                if (this.placeIn(t, r!, origNumAttempts)) {
                    t.room = r;
                    return true;
                }
            }
        }
        const TS = PlayScene.TILE_SIZE;
        t.x = n.x + TS;
        t.y = n.y;
        if (this.canWalk(t))
            return true;
        t.x = n.x - TS;
        if (this.canWalk(t))
            return true;
        t.x = n.x;
        t.y = n.y + TS;
        if (this.canWalk(t))
            return true;
        t.y = n.y - TS;
        if (this.canWalk(t))
            return true;
        const r = this.place(t, numAttempts);
        t.room = r;
        return r != undefined;
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
