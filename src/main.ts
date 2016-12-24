///<reference path='./pixi.js.d.ts'/>

import LoadingScene from "./scene/LoadingScene";
import PlayScene from "./scene/PlayScene";
import Scene from "./scene/Scene";
export default class Main {
	static instance: Main;
	/// How many seconds between updates.
	static readonly DELTA = 1 / 30;
	/// The renderer
	readonly renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer;
	private _scene: Scene;
	get scene(): Scene {
		return this._scene;
	}
	set scene(s: Scene) {
		this._scene = s;
		s.width = this.renderer.width;
		s.height = this.renderer.height;
	}
	constructor() {
		this.renderer = PIXI.autoDetectRenderer(720, 480, {
			backgroundColor: 0x000000,
	        antialias: false,
	        roundPixels: true
		});
		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
		this.renderer.view.tabIndex = 1;
		document.body.appendChild(this.renderer.view);
		this.scene = new LoadingScene();
		PIXI.loader.baseUrl = 'assets/';
		PIXI.loader
			.add("blank", "blank.png")
			.add("player", "player.png")
			.add("wall1", "wall1.png")
			.add("wall2", "wall2.png")
			.load((_) => this.scene = new PlayScene());
		setInterval(() => this.scene.update(Main.DELTA), Main.DELTA * 1000);
	}
	render() {
        requestAnimationFrame(this.render.bind(this));
		this.renderer.render(this.scene);
	}
}

Main.instance = new Main();
Main.instance.render();