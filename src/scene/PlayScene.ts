/// <reference path="../extra.d.ts" />

import Ladder from "../ui/Ladder";
import UIMap from "../ui/Map";
import { KeyboardPlayer, Player, Enemy, Entity } from "../ui/entities";
import { randomIn } from "../util/math";
import BasePoint from "../util/geom/BasePoint";
import Rectangle from "../util/geom/Rectangle";
import Counter from "../util/Counter";
import Scene from "./Scene";
import Text = PIXI.Text;

/// The main scene
export default class PlayScene extends Scene {
    static readonly TILE_SIZE = 16;
    static readonly NUM_ENEMIES = 2;
    static readonly TURN_DELAY = 0.1;
    readonly counter: Counter = new Counter();
    /// The number of seconds since the last turn
    // private sinceLast: number = 0;
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
        fontSize: 12,
        fill: "white",
        align: "left"
    });
    private inTurn: boolean = false;
    // private readonly gamepadEntities = new Map<number, GamepadEntity>();
    /// The grid as a displayable object.
    readonly map: UIMap;
    /// Add an entity
    constructor() {
        super();
        this.addUi(this.floorLabel);
        this.map = new UIMap(48, 48);
        this.addNonUi(this.map);
        this.addNonUi(this.ladder);
        const player = new KeyboardPlayer(this);
        this.addNonUi(player);
        this.place(player);
        this.players.push(player);
        for(let i = 0; i < PlayScene.NUM_ENEMIES; i++)
            this.makeEnemy();
        this.addUi(this.floorLabel);
        this.place(this.ladder);
        this.counter.register(PlayScene.TURN_DELAY, () => this.startTurn());
        /*
        const gamepads: Gamepad[] = navigator.getGamepads() || [];
        for (const g of gamepads)
            if (g !== undefined && g !== null)
                this.connectGamepad(g);
        // Register an event handler for when gamepads are connected
        window.addEventListener("gamepadconnected", (ge: GamepadEvent) => {
            this.connectGamepad(ge.gamepad);
        });
        // Register an event handler for when gamepads are disconnected
        window.addEventListener("gamepaddisconnected", (ge: GamepadEvent) => {
            const e = this.gamepadEntities.get(ge.gamepad.index) !;
            this.entities.splice(this.entities.indexOf(e), 1);
            this.removeChild(e);
        });*/
        window.addEventListener("keydown", (e: KeyboardEvent) => {
            if(e.keyCode === 32)
                this.makeEnemy();

        });
        // Add experimental functions to navigator.
        const n: FlyNavigator = navigator as FlyNavigator;

        if (n.publishServer != null)
            n.publishServer("Game session", {}).then((server: Server) => {
                server.onfetch = (event: FetchEvent) => {
                    const html = `<h1>Game controller</h1>
                        '<h3>You requested ${event.request.url} </h3>`;
                    event.respondWith(new Response(html, {
                        headers: { "Content-Type": "text/html" }
                    }));
                };
            });
    }
    private makeEnemy(): Enemy {
        const e = new Enemy(this);
        this.addNonUi(e);
        this.place(e);
        this.enemies.push(e);
        return e;
    }
    /// Advance to the next floor
    private advanceFloor() {
        this.endTurn();
        // Increment the floor number
        this.floor++;
        // Reset the map (clear, then generate on it)
        this.map.reset();
        // Place the ladder
        this.place(this.ladder);
        // Place the entities
        for(const p of this.players)
            this.place(p);
        for(const e of this.enemies) {
            // Make it not follow anything
            e.follow = undefined;
            e.path.splice(0);
            this.place(e);
        }
    }
    /*
    /// Runs when a gamepad is connected.
    private connectGamepad(g: Gamepad) {
        if (this.gamepadEntities.has(g.index))
            return;
        const player: Entity<GamepadControl> = new Entity(this, new GamepadControl(g));
        this.addEntity(player);
        this.gamepadEntities.set(g.index, player);
    }*/
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
    private place(p: BasePoint, numAttempts: number = 5): boolean {
        do {
            // Get a random room
            const r: Rectangle = randomIn(this.map.grid.rooms) !;
            // Place p in the room
            p.x = (r.x + Math.floor(Math.random() * r.width)) * PlayScene.TILE_SIZE;
            p.y = (r.y + Math.floor(Math.random() * r.height)) * PlayScene.TILE_SIZE;
        } while(this.isNotEmpty(p.x, p.y) && --numAttempts > 0)
        return numAttempts > 0;
    }
    /// Start a new turn
    startTurn() {
        this.inTurn = true;
    }
    endTurn() {
        this.inTurn = false;
        // End the turn
        for(const e of this.enemies)
            e.moved = false;
        for(const e of this.players)
            e.moved = false;
    }
    tryMoveEntity(e: Entity): boolean {
        return e.moved || e.tryMove()
    }    
    private enemiesSeeing(arr: Enemy[], p: Player) {
        for(const e of this.enemies)
            if(e.canSee(p))
                arr.push(e);
    }
    update(dt: number): void {
        this.counter.update(dt);
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
        // Get the first player in entities.
        const e = this.players[0];
        // Set the camera
        if(e !== undefined)
            this.setCamera(e.x, e.y);
    }
}
