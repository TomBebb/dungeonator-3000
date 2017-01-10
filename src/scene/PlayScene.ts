/// <reference path="../extra.d.ts" />

import UIMap from "../ui/Map";
import { GamepadControl, KeyboardControl } from "../control";
import { Entity } from "../ui/entities";
import { randomIn, Rectangle, pointEq, Point } from "../util/math";
import FastInts from "../util/FastInts";
import Container = PIXI.Container;
import Text = PIXI.Text;
import Main from "../main";

/// The main scene
export default class PlayScene extends Container {
    static readonly TILE_SIZE = 16;
    readonly delay: number = 0.15;
    private sinceLast: number = 0;
    entities: Entity<any>[] = [
        
    ];
    enemies: Entity<any>[] = [];
    players: Entity<GamepadControl | KeyboardControl>[] = [];
    private floor: number = 0;
    private readonly top: PIXI.Container = new PIXI.Container();
    private readonly floorLabel: Text = new Text(`Floor: ${this.floor}`, {
        fontFamily: "sans",
        fontSize: 12,
        fill: "white",
        align: "left"
    });
    private movedEntities: FastInts = new FastInts();
    private unmovedEntities: FastInts = new FastInts();
    private inTurn: boolean = false;
    private readonly gamepadEntities = new Map<number, Entity<GamepadControl>>();
    // The map.
    readonly map: UIMap;
    private addEntity(e: Entity<any>) {
        this.entities.push(e);
        if(e.control instanceof GamepadControl || e.control instanceof KeyboardControl)
            this.players.push(e);
        else
            this.enemies.push(e);
        this.place(e);
        this.addChild(e);
    }
    constructor() {
        super();
        this.top.addChild(this.floorLabel);
        this.addChild(this.top);
        const r = Main.instance.renderer;
        this.position.set(r.width / 2, r.height / 2);
        this.map = new UIMap(r.width / PlayScene.TILE_SIZE, r.height / PlayScene.TILE_SIZE);
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
        const r: Rectangle = randomIn(this.map.grid.rooms)!;
        p.x = (r.x + Math.floor(Math.random() * r.width)) * PlayScene.TILE_SIZE;
        p.y = (r.y + Math.floor(Math.random() * r.height)) * PlayScene.TILE_SIZE;
    }
    /// Start a new turn
    startTurn() {
        /// Fill `unmovedEntities` with the entities from `entities`.
        for(let i = 0; i < this.entities.length; i++)
            this.unmovedEntities.set(i, i);
        this.inTurn = true;
    }
    /// End the current turn
    endTurn() {
        this.inTurn = false;
        this.movedEntities.splice(0);
    }
    update(dt: number): void {
        // For each entity that hasn't moved ye
        for(let i = 0; i < this.unmovedEntities.length; i++) {
            const u = this.unmovedEntities[i];
            // If it has moved...
            if (u.tryMove()) {
                // Remove it from the `unmovedEntities` array for obvious reasons.
                this.unmovedEntities.splice(i, 1);
                // Add it to the `movedEntities` array.
                this.movedEntities.push(u);
            }
        }
        // When it's still in a turn but there are no more entities that can be moved.
        if(this.inTurn && this.unmovedEntities.length === 0)
            // End the turn
            this.endTurn();
        // When it's not in a turn
        else if(!this.inTurn) {
            this.sinceLast += dt;
            // Once `delay` seconds have passed
            if (this.sinceLast > this.delay) {
                this.sinceLast %= this.delay;
                // Start the turn
                this.startTurn();
            }
        }
        const e = this.players[0];
        this.pivot.set(e.x, e.y);
        this.top.pivot.set(e.x, e.y);
    }
}
