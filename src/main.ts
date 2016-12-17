import Scene from "./scene/Scene";
import LoadingScene from "./scene/LoadingScene";
import PlayScene from "./scene/PlayScene";
import Assets from "./util/Assets";
export default class Main {
	static instance: Main;
	static readonly DELTA = 1 / 30;
    readonly canvas = document.getElementById('game') ! as HTMLCanvasElement;
	readonly context = this.canvas.getContext("2d") !;
	readonly assets = new Assets();
	scene: Scene = new LoadingScene();
	constructor() {
        this.assets.load({
            images: [ "blank.png", "player.png", "wall1.png", "wall2.png" ]
        }).then((_) => this.scene = new PlayScene());
		this.canvas.tabIndex = 1;
		this.context.oImageSmoothingEnabled = false;
		this.context.msImageSmoothingEnabled = false;
		this.context.webkitImageSmoothingEnabled = false;
		setInterval(() => this.scene.update(Main.DELTA), Main.DELTA * 1000);
	}
	render() {
        requestAnimationFrame(this.render.bind(this));
		this.scene.render(this.context);
	}
}

Main.instance = new Main();
Main.instance.render();