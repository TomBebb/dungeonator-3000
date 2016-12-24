/// <reference path="../extra.d.ts" />

import Camera from "../Camera";
import Generator from "../util/Generator";
import UIMap from "../ui/Map";
import { GamepadControl } from "../control";
import { Entity } from "../ui/entities";
import { random, Point } from "../util/math";
import Container = PIXI.Container;
import Main from "../main";

export default class PlayScene extends Container {
    static readonly TILE_SIZE = 16;
    readonly delay: number = 0.1;
    private sinceLast: number = 0;
    entities: Entity<any>[] = [
        Entity.defaultPlayer(this),
        //Entity.defaultEnemy(this)
    ];
    readonly gamepadEntities = new Map<number, Entity<GamepadControl>>();
    readonly camera: Camera = new Camera();
    readonly map: UIMap;
    currentEntity: number = 0;
    constructor() {
        super();
        const r = Main.instance.renderer;
        this.map = new UIMap(r.width / PlayScene.TILE_SIZE, r.height / PlayScene.TILE_SIZE);
        this.addChild(this.map);
        this.camera.follow = this.entities[0];
        for (const entity of this.entities) {
            this.addChild(entity);
            this.place(entity);
        }
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
            this.entities.splice(this.entities.findIndex((oe) => e === e), 1);
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
        this.camera.follow = player;
        this.place(player);
        this.addChild(player);
        this.gamepadEntities.set(g.index, player);
    }
    /// Check if the position `x`, `y` is valid (i.e. clear of entities and tiles)
    isValidPosition(x: number, y: number): boolean {
        if (!this.map.grid.isValidPosition(x, y))
            return false;
        for (let e of this.entities)
            if (e.x === x && e.y === y)
                return false;
        return true;
    }
    /// Attempt to place the point `p` in the game.
    private place(p: Point, numAttempts: number = 5) {
        do {
            p.x = random(0, this.map.tileWidth) * PlayScene.TILE_SIZE;
            p.y = random(0, this.map.tileHeight) * PlayScene.TILE_SIZE;
        } while (!this.isValidPosition(p.x, p.y) && numAttempts-- > 0);
    }
    update(dt: number): void {
        this.camera.update();
        this.sinceLast += dt;
        if (this.sinceLast >= this.delay) {
            this.sinceLast -= this.delay;
            let nextIndex = this.currentEntity + 1;
            if (nextIndex >= this.entities.length)
                nextIndex = 0;
            const e = this.entities[this.currentEntity];
            if (e.tryMove()) {
                this.currentEntity = nextIndex;
                console.log(`${this.currentEntity} moved`);
            }
        }
    }
}
