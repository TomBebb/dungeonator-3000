/// <reference path="../extra.d.ts" />

import Camera from "../Camera";
import Generator from "../Generator";
import Grid from "../Grid";
import { GamepadControl } from "../control";
import { Entity } from "../entities";
import { random, Point } from "../util/math";
import Scene from "./Scene";
import Assets from "../util/Assets";

export default class PlayScene implements Scene {
    static readonly TILE_SIZE = 16;
    readonly delay: number = 0.5;
    private sinceLast: number = 0;
    private readonly gen: Generator = new Generator();
    entities: Entity<any>[] = [
    ];
    readonly camera: Camera = new Camera();
    readonly assets: Assets;
    readonly grid: Grid;
    constructor(assets: Assets) {
        this.assets = assets;
        this.grid = new Grid(64, 64, this.assets);
        this.entities.push(Entity.defaultPlayer(this, this.assets));
        this.entities.push(Entity.defaultEnemy(this, this.assets));
        this.camera.follow = this.entities[0];
        for(const entity of this.entities)
            this.place(entity);
        // Register an event handler for when gamepads are connected
        window.addEventListener("ongamepadconnected", (ge: GamepadEvent) => {
            // add a new player entity
            const player: Entity<GamepadControl> = new Entity(this, new GamepadControl(ge.gamepad), assets);
            this.entities.push(player);
            this.camera.follow = player;
        });
        // Register an event handler for when gamepads are disconnected
        window.addEventListener("ongamepaddisconnected", (ge: GamepadEvent) => {
            for(let i = 0; i < this.entities.length; i++) {
                const e = this.entities[i];
                // remove entities whose input is mapped to the gamepad that was just removed
                if (e.control instanceof Gamepad && e.control.index == ge.gamepad.index)
                    this.entities.splice(i);
            }
        });

        // Add experimental functions to navigator.
        const n: FlyNavigator = navigator as FlyNavigator;
        
        if(n.publishServer != null) {
            n.publishServer('Game session', {}).then((server: Server) => {
                server.onfetch = (event: FetchEvent) => {
                    const html = `<h1>Game controller</h1>
                        '<h3>You requested ${event.request.url} </h3>`;
                    event.respondWith(new Response(html, {
                        headers: { 'Content-Type': 'text/html' }
                    }));
                };
            });
        }
        this.gen.grid = this.grid;
        this.reset();
    }
    /// Check if the position `x`, `y` is valid (i.e. clear of entities and tiles)
    isValidPosition(x: number, y: number): boolean {
        if(!this.grid.isValidPosition(x, y))
            return false;
        for(let e of this.entities)
            if(e.x === x && e.y === y)
                return false;
        return true;
    }
    /// Reset the game to its initial state
    reset(): void {
        this.gen.generate();
        this.grid.internalDraw();
    }
    /// Attempt to place the point `p` in the game.
    private place(p: Point, numAttempts: number = 5) {
        do {
            p.x = random(1, this.grid.width - 2);
            p.y = random(1, this.grid.height - 2);
        } while(!this.isValidPosition(p.x, p.y) && numAttempts-- > 0);
    }
    render(c: CanvasRenderingContext2D): void {
        c.save();
        // clear the screen
        c.fillStyle = "#dcd";
        c.fillRect(0, 0, c.canvas.width, c.canvas.height);
        // apply camera transformations
        this.camera.apply(c);
        // draw the grid
        this.grid.render(c);
        // draw players and enemies
        for(const e of this.entities)
            e.draw(c);
        c.restore();
    }
    update(dt: number): void {
        for(const e of this.entities)
            e.update(dt);
        this.sinceLast += dt;
        if(this.sinceLast >= this.delay) {
            this.sinceLast -= this.delay;
            for(const e of this.entities)
                e.step();
        }
        setTimeout(this.update.bind(this, dt), dt);
    }
}
