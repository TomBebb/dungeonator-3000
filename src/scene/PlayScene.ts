/// <reference path="../extra.d.ts" />

import UIMap from "../ui/Map";
import { GamepadControl, KeyboardControl } from "../control";
import { Entity } from "../ui/entities";
import { randomIn, Rectangle, pointEq, Point } from "../util/math";
import Bits from "../util/Bits";
import Container = PIXI.Container;
import Text = PIXI.Text;
import Main from "../main";

/// The main scene
export default class PlayScene extends Container {
    static readonly TILE_SIZE = 16;
    static readonly MAX_ENTITIES = 16;
    readonly delay: number = 0.3;
    /// The number of seconds since the last turn
    private sinceLast: number = 0;
    /// The entities contained in the scene
    entities: Entity<any>[] = [];
    /// The enemies, where each set bit is an index into `entities`.
    readonly enemies = new Bits(PlayScene.MAX_ENTITIES);
    /// The players, where each set bit is an index into `entities`.
    readonly players = new Bits(PlayScene.MAX_ENTITIES);
    private floor: number = 0;
    private readonly top: PIXI.Container = new PIXI.Container();
    private readonly floorLabel: Text = new Text(`Floor: ${this.floor}`, {
        fontFamily: "sans",
        fontSize: 12,
        fill: "white",
        align: "left"
    });
    /// The entities that have moved already in this turn, where every set bit is an index into `entities`.
    private readonly movedEntities: Bits = new Bits(PlayScene.MAX_ENTITIES);
    private inTurn: boolean = false;
    private readonly gamepadEntities = new Map<number, Entity<GamepadControl>>();
    // The map.
    readonly map: UIMap;
    /// Add an entity
    private addEntity(e: Entity<any>) {
        const index = this.entities.length;
        this.entities.push(e);
        if(e.control instanceof GamepadControl || e.control instanceof KeyboardControl)
            this.players.set(index);
        else
            this.enemies.set(index);
        this.place(e);
        this.addChild(e);
    }
    constructor() {
        super();
        this.top.addChild(this.floorLabel);
        this.addChild(this.top);
        const r = Main.instance.renderer;
        this.position.set(r.width / 2, r.height / 2);
        this.map = new UIMap(64, 64);
        this.addChild(this.map);
        this.addEntity(Entity.defaultPlayer(this));
        // this.addEntity(Entity.defaultEnemy(this));
        this.addChild(this.floorLabel);
        const gamepads: Gamepad[] = navigator.getGamepads() || [];
        for(const g of gamepads)
            if(g !== undefined && g !== null)
                this.connectGamepad(g);
        // Register an event handler for when gamepads are connected
        window.addEventListener("gamepadconnected", (ge: GamepadEvent) => {
            this.connectGamepad(ge.gamepad);
        });
        // Register an event handler for when gamepads are disconnected
        window.addEventListener("gamepaddisconnected", (ge: GamepadEvent) => {
            const e = this.gamepadEntities.get(ge.gamepad.index)!;
            this.entities.splice(this.entities.indexOf(e), 1);
            this.removeChild(e);
        });
        // Add experimental functions to navigator.
        const n: FlyNavigator = navigator as FlyNavigator;
        
        if (n.publishServer != null) {
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
    }
    private connectGamepad(g: Gamepad) {
        if(this.gamepadEntities.has(g.index))
            return;
        const player: Entity<GamepadControl> = new Entity(this, new GamepadControl(g));
        this.entities.push(player);
        this.place(player);
        this.addChild(player);
        this.gamepadEntities.set(g.index, player);
    }
    /// Check if the position `x`, `y` is clear of entities and tiles
    isEmptyAt(p: Point): boolean {
        return this.map.isEmptyAt(p) && this.entities.find((q) => pointEq(p, q)) == undefined;
    }
    /// Check if the position `x`, `y` is clear of entities and tiles
    isNotEmptyAt(p: Point): boolean {
        return this.map.isNotEmptyAt(p) || this.entities.find((q) => pointEq(p, q)) != undefined;
    }
    /// Attempt to place the point `p` in the game.
    private place(p: Point) {
        // Get a random room
        const r: Rectangle = randomIn(this.map.grid.rooms)!;
        // Place p in the room
        p.x = (r.x + Math.floor(Math.random() * r.width)) * PlayScene.TILE_SIZE;
        p.y = (r.y + Math.floor(Math.random() * r.height)) * PlayScene.TILE_SIZE;
    }
    /// Start a new turn
    startTurn() {
        this.inTurn = true;
    }
    /// End the current turn
    endTurn() {
        this.inTurn = false;
        // Remove all the entities
        this.movedEntities.clear();
    }
    update(dt: number): void {
        // For each entity
        for(let i = 0; i < this.entities.length; i++) {
            if(this.movedEntities.get(i))
                continue;
            // If it could be moved
            if (this.entities[i].tryMove())
                this.movedEntities.unset(i);
        }
        // When it's still in a turn but there are no more entities that can be moved.
        if(this.inTurn && !this.movedEntities.all(true))
            // End the turn
            this.endTurn();
        // When it's not in a turn
        else if(!this.inTurn) {
            this.sinceLast += dt;
            // Once `delay` seconds have passed
            if (this.sinceLast > this.delay) {
                this.sinceLast -= this.delay;
                console.log(this.sinceLast)
                // Start the turn
                this.startTurn();
            }
        }
        // Get the first player in entities.
        const e = this.entities[this.players.first(true)];
        this.pivot.set(e.x, e.y);
        this.top.pivot.set(e.x, e.y);
    }
}
