///<reference path='./pixi.d.ts'/>

import LoadingScene from "./scene/LoadingScene";
import TitleScene from "./scene/TitleScene";
import Scene from "./scene/Scene";

import SystemRenderer = PIXI.SystemRenderer;

/// The main class, that sets up game.
///
/// This uses the singleton pattern to make scene and renderer accessible to
/// the rest of the game, as there is only one instance of this.
export default class Main {
    /// The singleton instance of this class.
    static instance: Main;
    /// How many seconds between updates.
    private static readonly DELTA = 1 / 30;
    /// The renderer, which has a method 'render' that renders a displayable object.
    readonly renderer: SystemRenderer = PIXI.autoDetectRenderer(1024, 640, {
        backgroundColor: 0x000000,
        antialias: false,
        roundPixels: true
    });
    /// The scene to update and render.
    scene: Scene;

    constructor() {
        // Store instance in class.
        Main.instance = this;
        this.renderer.view.tabIndex = 1;
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        // Set which assets should be loaded by PIXI
        PIXI.loader.baseUrl = 'assets/';
        PIXI.loader
            .add("coins", "coins.png")
            .add("chests", "chests.png")
            .add("blank", "blank.png")
            .add("player", "player.png")
            .add("zombie", "zombies.png")
            .add("wall1", "wall1.png")
            .add("wall2", "wall2.png")
            .add("ladder", "ladder.png")
            // Change to the title scene once done loading.
            .load((_) => this.scene.advance(new TitleScene(), true));
        // Start with loading scene.
        this.scene = new LoadingScene();
        // Register `scene.update` to run every `DELTA` seconds
        setInterval(() => this.scene.update(Main.DELTA), Main.DELTA * 1000);
        // Add renderer canvas to document.
        document.body.appendChild(this.renderer.view);
        // Render the scene for the first time, and register to keep running
        this.render();
    }
    /// Render `scene`
    render() {
        // Register this function to run when the next frame of animation starts.
        requestAnimationFrame(this.render.bind(this));
        // Render the scene
        this.renderer.render(this.scene);
    }
}

new Main().render();