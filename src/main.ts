///<reference path='./pixi.d.ts'/>

import LoadingScene from "./scene/LoadingScene";
import PlayScene from "./scene/PlayScene";
import Scene from "./scene/Scene";

import test from "./test";
import PIXI = require("pixi.js");
export default class Main {
    static instance: Main;
    /// How many seconds between updates.
    private static readonly DELTA = 1 / 30;
    /// The renderer
    readonly renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer = PIXI.autoDetectRenderer(1024, 640, {
        backgroundColor: 0x000000,
        antialias: false,
        roundPixels: true
    });
    scene: Scene;
    constructor() {
        test();
        Main.instance = this;
        this.renderer.view.tabIndex = 1;
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        // Set which assets should be loaded by PIXI
        PIXI.loader.baseUrl = 'assets/';
        PIXI.loader
            .add("blank", "blank.png")
            .add("player", "player.png")
            .add("wall1", "wall1.png")
            .add("wall2", "wall2.png")
            .add("ladder", "ladder.png")
            // make the scene a play scene once everything has loaded
            .load((_) => this.scene = new PlayScene());
        this.scene = new LoadingScene();
        setInterval(() => this.scene.update(Main.DELTA), Main.DELTA * 1000);
        document.body.appendChild(this.renderer.view);
    }
    render() {
        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene);
    }
}

new Main().render();