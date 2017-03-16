import Ladder from "../ui/Ladder";
import UIMap from "../ui/Map";
import Minimap from "../ui/Minimap";
import { KeyboardPlayer, MousePlayer, GamepadPlayer, Player, Enemy, Entity } from "../ui/entities";
import { clamp, randomIn } from "../util/math";
import { BasePoint } from "../util/geom/Point";
import { Rectangle } from "../util/geom/Rectangle";
import Counter from "../util/Counter";
import {Save, save, load} from "../util/save";
import Scene from "./Scene";
import PauseScene from "./PauseScene";
import Main from "../main";
import Text = PIXI.Text;

/// The main scene
export default class PlayScene extends Scene {
    static readonly TILE_SIZE = 16;
    static readonly NUM_ENEMIES = 2;
    static readonly TURN_DELAY = 0.1;
    readonly counter: Counter = new Counter();
    /// The entities contained in the scene
    readonly enemies: Enemy[] = [];
    /// The players, where each set bit is an index into `entities`.
    readonly players: Player[] = [];
    private _floor: number = 1;
    
    set floor(v: number) {
        this._floor = v;
        this.floorLabel.text = `Floor: ${this.floor}`;
    }
    get floor(): number {
        return this._floor;
    }
    private ladder:Ladder = new Ladder();
    private readonly floorLabel: Text = new Text(`Floor: ${this._floor}`, {
        fontFamily: "sans",
        fontSize: 20,
        fill: "white",
        align: "left"
    });
    private inTurn: boolean = false;
    private readonly gamepadPlayers = new Map<number, GamepadPlayer>();
    /// The grid as a displayable object.
    readonly map: UIMap;
    readonly minimap: Minimap;
    private pauseScene: PauseScene
    /// Add an entity
    constructor(input: "mouse" | "keyboard" | "gamepad") {
        super();
        this.pauseScene = new PauseScene(this, input);
        this.addUi(this.floorLabel);
        const r = Main.instance.renderer;
        this.map = new UIMap(128, 128);
        this.addNonUi(this.map);
        this.addNonUi(this.ladder);
        for(let i = 0; i < PlayScene.NUM_ENEMIES; i++)
            this.makeEnemy();
        this.addUi(this.floorLabel);
        this.place(this.ladder);
        this.minimap = new Minimap(this.map.grid, this.players, this.ladder);
        this.minimap.position.set(r.width - this.minimap.width - 10, 10);
        this.addUi(this.minimap);
        this.counter.register(PlayScene.TURN_DELAY, () => this.startTurn());
        const gamepads: Gamepad[] = navigator.getGamepads() || [];
        let player: Player;
        switch(input) {
            case "keyboard":
                player = new KeyboardPlayer(this);
                break;
            case "mouse":
                player = new MousePlayer(this);
                break;
            default:
                const gps = navigator.getGamepads();
                let index = 0;
                for(let i = 0; i < gps.length; i++)
                    if(gps[i] != null) {
                        index = i;
                        break;
                    }
                player = new GamepadPlayer(this, index);
                this.gamepadPlayers.set(index, player);
                break;
        }
        this.addNonUi(player);
        player.room = this.place(player);
        this.players.push(player);
        for (const g of gamepads)
            if (g !== undefined && g !== null)
                this.connectGamepad(g);
    }
    pause() {
        this.advance(this.pauseScene, false);
    }
    private makeEnemy(): Enemy {
        const e = new Enemy(this);
        this.addNonUi(e);
        e.room = this.place(e);
        this.enemies.push(e);
        return e;
    }
    /// Advance to the next floor
    private advanceFloor() {
        this.endTurn();
        let saveData: Save | undefined = load();
        const f = ++this.floor;
        if(saveData == undefined)
            saveData = {
                maxFloor: f
            };
        else if(f > saveData.maxFloor)
            saveData.maxFloor = f;
        // Increment the floor number
        save(saveData);
        // Reset the map (clear, then generate on it)
        this.map.reset();
        this.minimap.redraw();
        // Place the ladder
        this.place(this.ladder);
        // Place the entities
        for(const p of this.players)
            this.place(p);
        for(const e of this.enemies) {
            // Make it not follow anything
            e.follow = undefined;
            e.clearPath();
            this.place(e);
        }
    }
    /// Runs when a gamepad is connected.
    private connectGamepad(g: Gamepad) {
        if (this.gamepadPlayers.has(g.index))
            return;
        const player: GamepadPlayer = new GamepadPlayer(this, g.index);
        this.addNonUi(player);
        this.players.push(player);
        this.gamepadPlayers.set(g.index, player);
        this.placeNear(this.players[0], player);
    }
    /// Check if the position `x`, `y` is clear of entities and tiles
    canWalk(x: number, y: number): boolean {
        const q = (q:Entity) => q.x === x && q.y === y;
        return this.map.canWalk(x, y) && this.players.find(q) == undefined && this.enemies.find(q) == undefined;
    }
    /// Check if the position `x`, `y` is clear of entities and tiles
    isNotEmpty(x: number, y: number): boolean {
        const q = (q:Entity) => q.x === x && q.y === y;
        return this.map.isNotEmpty(x, y) || this.players.find(q) != undefined || this.enemies.find(q) != undefined;
    }
    /// Attempt to place the point `p` in the game.
    private place(p: BasePoint, numAttempts: number = 5): Rectangle | undefined {
        let r: Rectangle;
        do {
            // Get a random room
            r = randomIn(this.map.grid.rooms) !;
            // Place p in the room
            if(this.placeIn(p, r, numAttempts))
                return r;
        } while(this.isNotEmpty(p.x, p.y) && --numAttempts > 0)
        return numAttempts > 0 ? r : undefined;
    }
    private placeIn(p: BasePoint, r: Rectangle, numAttempts: number = 5): boolean {
        do {
            p.x = (r.x + Math.floor(Math.random() * r.width)) * PlayScene.TILE_SIZE;
            p.y = (r.y + Math.floor(Math.random() * r.height)) * PlayScene.TILE_SIZE;
        } while(this.isNotEmpty(p.x, p.y) && --numAttempts >= 0)
        return numAttempts < 0;
    }
    /// Place the entity `t` near `n`
    private placeNear(t: Entity, n: Entity, numAttempts: number = 5): boolean {
        if(n.room != null)
            while(numAttempts-- > 0) {
                const r = randomIn(this.map.grid.rooms);
                if(this.placeIn(t, r!, numAttempts)) {
                    t.room = r;
                    return true;
                }
            }
        const TS = PlayScene.TILE_SIZE;
        if(this.canWalk(n.x - TS, n.y)) {
            t.x = n.x - TS;
            return true;
        } else if(this.canWalk(n.x + TS, n.y)) {
            t.x = n.x + TS;
            return true;
        } else if(this.canWalk(n.x, n.y - TS)) {
            t.y = n.x - TS;
            return true;
        } else if(this.canWalk(n.x, n.y + TS)) {
            t.y = n.x + TS;
            return true;
        }
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
    tryMoveEntity(e: Entity): boolean {
        return e.moved || e.tryMove()
    }
    /// Fil `arr` with the enemies that can see the player.
    private enemiesSeeing(arr: Enemy[], p: Player) {
        for(const e of this.enemies)
            if(e.canSee(p))
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
            let enemies: Enemy[] = [];
            let numMoved = 0;
            for(const p of this.players)
                if(this.tryMoveEntity(p)) {
                    enemies.splice(0);
                    this.enemiesSeeing(enemies, p);
                    for(const e of enemies)
                        if(e.follow != p)
                            e.startFollowing(p);
                    numMoved++;
                    if(this.ladder.x == p.x && this.ladder.y == p.y)
                        this.advanceFloor();
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
