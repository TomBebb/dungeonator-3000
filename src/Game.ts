/// <reference path="extra.d.ts" />

import Camera from "./Camera";
import Generator from "./Generator";
import Grid from "./Grid";
import { GamepadControl } from "./control";
import { Entity } from "./entities";
import { random, Point } from "./math";
import { Assets } from "./util";

export default class Game {
    static readonly TILE_SIZE = 16;
    readonly delay: number = 0.5;
    private sinceLast: number = 0;
    private readonly gen: Generator = new Generator();
    readonly canvas: HTMLCanvasElement = document.getElementById('game') ! as HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D = this.canvas.getContext("2d") !;
    entities: Entity<any>[] = [
    ];
    readonly camera: Camera = new Camera();
    readonly assets: Promise<Assets> = Assets.load({
            images: [ "blank.png", "player.png", "wall1.png", "wall2.png" ]
        });
    readonly grid: Grid = new Grid(64, 64, this.assets);
    constructor() {
        this.canvas.tabIndex = 1;
        this.context.oImageSmoothingEnabled = false;
        this.context.msImageSmoothingEnabled = false;
        this.context.webkitImageSmoothingEnabled = false;
        this.assets.then((assets) => {
            this.entities.push(Entity.defaultPlayer(this, assets));
            this.entities.push(Entity.defaultEnemy(this, assets));
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
        this.update(1 / 30);
        this.render();
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
    render(): void {
        requestAnimationFrame(this.render.bind(this));
        this.context.save();
        // clear the screen
        this.context.fillStyle = "#dcd";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // apply camera transformations
        this.camera.apply(this.context);
        // draw the grid
        this.grid.render(this.context);
        // draw players and enemies
        for(const e of this.entities)
            e.draw(this.context);
        this.context.restore();
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
