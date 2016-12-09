/// <reference path="extra.d.ts" />

import Camera from "./Camera";
import Generator from "./Generator";
import Grid from "./Grid";
import { GamepadControl } from "./control";
import { Entity } from "./entities";
import { random, Point } from "./math";

export default class Game {
    static readonly TILE_SIZE = 32;
    readonly grid: Grid = new Grid(64, 64);
    private readonly gen: Generator = new Generator();
    readonly canvas: HTMLCanvasElement = document.getElementById('game') ! as HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D = this.canvas.getContext("2d") !;
    entities: Entity<any>[] = [
        Entity.defaultPlayer(this),
        Entity.defaultEnemy(this)
    ];
    readonly camera: Camera = new Camera(this.entities[0]);
    constructor() {
        for(let entity of this.entities)
            this.place(entity);
        this.canvas.tabIndex = 1;

        // Add experimental functions to navigator.
        const n: FlyNavigator = navigator as FlyNavigator;
        // Register an event handler for when gamepads are connected
        window.addEventListener("ongamepadconnected", (ge: GamepadEvent) => {
            // add a new player entity
            const player: Entity<GamepadControl> = new Entity(this, new GamepadControl(ge.gamepad));
            this.entities.push(player);
            this.camera.follow = player;
        });

        window.addEventListener("ongamepaddisconnected", (ge: GamepadEvent) => {
            this.entities.forEach((e: Entity<any>, i: number) => {
                // remove entities whose input is mapped to the gamepad that was just removed
                if (e.control instanceof Gamepad && e.control.index == ge.gamepad.index)
                    this.entities.splice(i);
            });
        });
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
            if(e.x == x && e.y == y)
                return false;
        return true;
    }
    /// Reset the game to its initial state
    reset(): void {
        this.gen.generate();
        this.grid.internalDraw();
    }
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
        this.entities.forEach((p) => p.draw(this.context));
        this.context.restore();
    }
    update(dt: number): void {
        this.entities.forEach((p) => p.update(dt));
        setTimeout(this.update.bind(this, dt), dt);
    }
}
