import Chest from "../ui/Chest";
import Item from "../ui/Item";
import Ladder from "../ui/Ladder";
import UIMap from "../ui/Map";
import Minimap from "../ui/Minimap";
import Entity from "../ui/entities";
import {GamepadInput, FollowInput} from "../util/input";
import { clamp, randomIn } from "../util/math";
import { BasePoint } from "../util/geom/Point";
import { BaseRectangle, Rectangle } from "../util/geom/Rectangle";
import Counter from "../util/Counter";
import QuadTree from "../util/geom/QuadTree";
import {Save, save, load} from "../util/save";
import Scene from "./Scene";
import PauseScene from "./PauseScene";
import Main from "../main";
import Text = PIXI.Text;

/// The main scene
export default class PlayScene extends Scene {
    static readonly TILE_SIZE = 16;
    static readonly NUM_CHESTS = 8;
    static readonly NUM_ENEMIES = 10;
    static readonly TURN_DELAY = 0.1;
    readonly counter: Counter = new Counter();
    /// The entities contained in the scene
    readonly enemies: Entity<FollowInput>[] = [];
    /// The players, where each set bit is an index into `entities`.
    readonly players: Entity<any>[] = [];
    private _floor: number;
    
    set floor(v: number) {
        this._floor = v;
        this.floorLabel.text = `Floor: ${this.floor.toLocaleString(undefined, {minimumIntegerDigits: 3})}`;
    }
    get floor(): number {
        return this._floor;
    }
    private _coins: number;
    
    set coins(v: number) {
        this._coins = v;
        this.coinsLabel.text = `Coins: ${this.coins.toLocaleString(undefined, {minimumIntegerDigits: 6})}`;
    }
    get coins(): number {
        return this._coins;
    }
    private items: Item[] = [];
    itemQuadTree: QuadTree<Item>;
    private quadTree: QuadTree<BaseRectangle>;
    private readonly floorLabel: Text = new Text('', {
        fontFamily: "sans",
        fontSize: 20,
        fill: "white",
        align: "left"
    });
    private readonly coinsLabel: Text = new Text('', {
        fontFamily: "sans",
        fontSize: 20,
        fill: "white",
        align: "left"
    });
    private inTurn: boolean = false;
    private readonly gamepadPlayers = new Map<number, Entity<GamepadInput>>();
    /// The grid as a displayable object.
    readonly map: UIMap;
    readonly minimap: Minimap;
    private pauseScene: PauseScene
    /// Add an entity
    constructor(input: "mouse" | "keyboard" | "gamepad") {
        super();
        let s = load();
        this.floor = 1;
        if(s != undefined && s.coins)
            this.coins = s.coins;
        else
            this.coins = 0;
        this.pauseScene = new PauseScene(this, input);
        this.addUi(this.floorLabel);
        this.coinsLabel.x = Main.instance.renderer.width / 2;
        this.addUi(this.coinsLabel);
        const r = Main.instance.renderer;
        this.map = new UIMap(128, 128);
        this.addNonUi(this.map);
        const rect = new Rectangle(0, 0, this.map.width, this.map.height);
        // Make quad tree for all collidable objects
        this.quadTree = new QuadTree<BaseRectangle>(rect);
        // Make items
        this.itemQuadTree = new QuadTree<Item>(rect);
        const ladder = new Ladder();
        this.addItem(ladder);
        for(let i = 0; i < PlayScene.NUM_CHESTS; i++)
            this.addItem(new Chest());
        // Make enemies
        for(let i = 0; i < PlayScene.NUM_ENEMIES; i++)
            this.makeEnemy();
        this.addUi(this.floorLabel);
        this.counter.register(PlayScene.TURN_DELAY, () => this.startTurn());
        const gamepads: Gamepad[] = navigator.getGamepads() || [];
        let player: Entity<any> = Entity.defaultPlayer(this);
        this.quadTree.insert(player);
        this.addNonUi(player);
        player.room = this.place(player);
        this.players.push(player);
        this.minimap = new Minimap(this.map.grid, this.players, ladder);
        this.minimap.position.set(r.width - this.minimap.width - 10, 10);
        this.addUi(this.minimap);
        for (const g of gamepads)
            if (g !== undefined && g !== null)
                this.connectGamepad(g);
        
    }
    private addEntity(e: Entity<any>) {
        this.resetEntity(e);
        this.addNonUi(e);
        (e.input instanceof FollowInput ? this.enemies : this.players).push(e);
    }
    private resetEntity(e: Entity<any>) {
        this.quadTree.insert(e);
        e.room = this.place(e);
        if(e.input instanceof FollowInput) {
            // Make it not follow anything
            e.input.follow = undefined;
            // Clear its path, so it won't teleport to points along its previous path
            e.input.clearPath();
        }
    }
    private resetItem(item: Item) {
        this.itemQuadTree.insert(item);
        this.quadTree.insert(item);
        this.place(item);
    }
    private addItem(item: Item) {
        this.resetItem(item);
        this.items.push(item);
        this.addNonUi(item);
    }
    pause() {
        this.pauseScene.cacheAsBitmap = false;
        this.advance(this.pauseScene, false);
        this.pauseScene.cacheAsBitmap = true;
    }
    private makeEnemy(): Entity<FollowInput> {
        const e = Entity.newEnemy(this);
        this.addEntity(e);
        return e;
    }
    /// Advance to the next floor
    advanceFloor() {
        this.endTurn();
        let saveData: Save | undefined = load();
        const f = ++this.floor;
        if(saveData == undefined)
            saveData = {
                maxFloor: f,
                coins: this.coins
            };
        else
            saveData.coins = this.coins;
        if(f > saveData.maxFloor)
            saveData.maxFloor = f;
        // Increment the floor number
        save(saveData);
        // Reset the map (clear, then generate on it)
        this.map.reset();
        // Clear quad trees
        this.quadTree.clear();
        this.itemQuadTree.clear();
        // Re-place items
        for(const i of this.items)
            this.resetItem(i);
        // Place the entities
        for(const p of this.players)
            this.resetEntity(p);
        for(const e of this.enemies)
            this.resetEntity(e);
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
        const q = (q:BasePoint) => q.x === r.x && q.y === r.y;
        const os: BaseRectangle[] = [];
        this.quadTree.retrieve(os, r);
        return this.map.canWalk(r.x, r.y) && os.find(q) == undefined;
    }
    /// Check if the tile under `r` is clear of anything
    isNotEmpty(r: BaseRectangle): boolean {
        const q = (q:BasePoint) => q.x === r.x && q.y === r.y;
        const os: BaseRectangle[] = [];
        this.quadTree.retrieve(os, r);
        return this.map.isNotEmpty(r.x, r.y) || os.find(q) != undefined;
    }
    /// Attempt to place the point `p` in the game.
    private place(p: BaseRectangle, numAttempts: number = 5): Rectangle | undefined {
        let r: Rectangle;
        do {
            // Get a random room
            r = randomIn(this.map.grid.rooms) !;
            // Place p in the room
            if(this.placeIn(p, r, numAttempts))
                return r;
        } while(this.isNotEmpty(p) && --numAttempts > 0)
        return numAttempts > 0 ? r : undefined;
    }
    private placeIn(p: BaseRectangle, r: Rectangle, numAttempts: number = 5): boolean {
        do {
            p.x = (r.x + Math.floor(Math.random() * r.width)) * PlayScene.TILE_SIZE;
            p.y = (r.y + Math.floor(Math.random() * r.height)) * PlayScene.TILE_SIZE;
        } while(this.isNotEmpty(p) && --numAttempts >= 0)
        return numAttempts < 0;
    }
    /// Place the entity `t` near `n`
    private placeNear(t: Entity<any>, n: Entity<any>, numAttempts: number = 5): boolean {
        if(n.room != null)
            while(numAttempts-- > 0) {
                const r = randomIn(this.map.grid.rooms);
                if(this.placeIn(t, r!, numAttempts)) {
                    t.room = r;
                    return true;
                }
            }
        const TS = PlayScene.TILE_SIZE;
        t.x = n.x + TS;
        t.y = n.y;
        if(this.canWalk(t))
            return true;
        t.x = n.x - TS;
        if(this.canWalk(t))
            return true;
        t.x = n.x;
        t.y = n.y + TS;
        if(this.canWalk(t))
            return true;
        t.y = n.y - TS;
        if(this.canWalk(t))
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
        for(const e of this.enemies)
            e.moved = false;
        for(const e of this.players)
            e.moved = false;
        this.minimap.redraw();
    }
    /// Try moving the entity, return true if it could be moved.
    tryMoveEntity(e: Entity<any>): boolean {
        return e.moved || e.tryMove()
    }
    /// Fil `arr` with the enemies that can see the player.
    private enemiesSeeing(arr: Entity<FollowInput>[], p: Entity<any>) {
        for(const e of this.enemies)
            if(e.input.canSee(p))
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
            for(const p of this.players)
                if(this.tryMoveEntity(p)) {
                    enemies.splice(0);
                    this.enemiesSeeing(enemies, p);
                    for(const e of enemies)
                        if(e.input.follow != p)
                            e.input.startFollowing(p);
                    numMoved++;
                }
            for(const e of this.enemies)
                if(this.tryMoveEntity(e))
                    numMoved++;
            if(numMoved == this.enemies.length + this.players.length)
                this.endTurn();
        }
        let tx = 0, ty = 0;
        // Get the first player in entities.
        for(const p of this.players) {
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
