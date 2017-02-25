/// <reference path="../extra.d.ts" />

import UIMap from "../ui/Map";
import { Entity, KeyboardPlayer, Player, Enemy } from "../ui/entities";
import { randomIn } from "../util/math";
import BasePoint from "../util/geom/BasePoint";
import Rectangle from "../util/geom/Rectangle";
import Bits from "../util/ds/Bits";
import Counter from "../util/Counter";
import Scene from "./Scene";
import Text = PIXI.Text;

/// The main scene
export default class PlayScene extends Scene {
    static readonly TILE_SIZE = 16;
    static readonly MAX_ENTITIES = 16;
    static readonly TURN_DELAY = 0.1;
    readonly counter: Counter = new Counter();
    /// The number of seconds since the last turn
    // private sinceLast: number = 0;
    /// The entities contained in the scene
    entities: Entity[] = [];
    /// The players, where each set bit is an index into `entities`.
    readonly players: KeyboardPlayer[] = [];
    private floor: number = 0;
    private readonly floorLabel: Text = new Text(`Floor: ${this.floor}`, {
        fontFamily: "sans",
        fontSize: 12,
        fill: "white",
        align: "left"
    });
    /// The entities that have moved already in this turn, where every set bit is an index into `entities`.
    private readonly movedEntities: Bits = new Bits(PlayScene.MAX_ENTITIES);
    private inTurn: boolean = false;
    // private readonly gamepadEntities = new Map<number, GamepadEntity>();
    // The map.
    readonly map: UIMap;
    /// Add an entity
    private addEntity(e: Entity) {
        this.entities.push(e);
        if (e instanceof KeyboardPlayer)
            this.players.push(e as Player);
        this.place(e);
        this.addNonUi(e);
    }
    constructor() {
        super(0xcccccc);
        this.addUi(this.floorLabel);
        this.map = new UIMap(48, 48);
        this.addNonUi(this.map);
        const player = new KeyboardPlayer(this);
        this.addEntity(player);
        this.addUi(this.floorLabel);
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
                this.addEntity(new Enemy(this, player));
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
    isEmpty(x: number, y: number): boolean {
        return this.map.isEmpty(x, y) && this.entities.find((q) => q.x === x && q.y === y) == undefined;
    }
    /// Check if the position `x`, `y` is clear of entities and tiles
    isNotEmpty(x: number, y: number): boolean {
        return this.map.isNotEmpty(x, y) || this.entities.find((q) => q.x === x && q.y === y) != undefined;
    }
    /// Attempt to place the point `p` in the game.
    private place(p: BasePoint) {
        // Get a random room
        const r: Rectangle = randomIn(this.map.grid.rooms) !;
        // Place p in the room
        p.x = (r.x + Math.floor(Math.random() * r.width)) * PlayScene.TILE_SIZE;
        p.y = (r.y + Math.floor(Math.random() * r.height)) * PlayScene.TILE_SIZE;
    }
    /// Start a new turn
    startTurn() {
        this.inTurn = true;
        //for(const c of this.entities)
        //    c.visible = Math.abs(c.x - this.pivot.x) * 1.5 < Main.instance.renderer.width && Math.abs(c.y - this.pivot.y) * 1.5 < Main.instance.renderer.height;
    }
    /// End the current turn
    endTurn() {
        this.inTurn = false;
        // Remove all the entities
        this.movedEntities.clear();
    }
    update(dt: number): void {
        this.counter.update(dt);
        // If it is in a turn
        if (this.inTurn) {
            let numMoved = 0;
            for(const e of this.entities)
                if(e.moved || e.tryMove())
                    numMoved++;
            if(numMoved === this.entities.length)
                // End the turn
                for(const e of this.entities)
                    e.moved = false;
        }
        // Get the first player in entities.
        const e = this.players[0];
        // Set the camera
        if(e !== undefined)
            this.setCamera(e.x, e.y);
    }
}
