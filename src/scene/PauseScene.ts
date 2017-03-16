import Main from '../main';
import Scene from './Scene';
import Graphics = PIXI.Graphics;
import Text = PIXI.Text;

export default class PauseScene extends Scene {
	readonly scene: Scene;
	readonly overlay: Graphics = new Graphics();
	readonly paused: Text = new Text("Paused", {
		align: 'centre',
		fontSize: 60,
		fill: 'white'
	});
	readonly detail: Text = new Text("", {
		align: 'centre',
		fontSize: 20,
		fill: 'white'
	});
	constructor(scene: Scene, input: "mouse" | "gamepad" | "keyboard") {
		super();
		switch(input) {
			case "mouse":
				this.detail.text = "Click to resume";
				break;
			case "keyboard":
				this.detail.text = "Press Enter or Space to resume";
				break;
			case "gamepad":
				this.detail.text = "Press Start to resume";
				break;
		}
		const r = Main.instance.renderer;
		this.paused.position.set((r.width - this.paused.width) / 2, (r.height - this.paused.height) / 2);
		this.detail.position.set((r.width - this.detail.width) / 2, this.paused.y + this.paused.height * 2);

		this.scene = scene;
		this.addChild(scene);
		this.addChild(this.overlay);
		this.overlay.beginFill(0, 0.35);
		this.overlay.drawRect(0, 0, r.width, r.height);
		this.overlay.endFill();
		this.addChild(this.paused);
		this.addChild(this.detail);
		const resume = PauseScene.prototype.advance.bind(this, this.scene, false);
		this.addEvent("mousedown", resume);
		this.addEvent("keyup", resume);
	}
	update(dt: number) {
		super.update(dt);
		const gps = navigator.getGamepads();
		for(const gp of gps)
			if(gp != null && gp.buttons[9].pressed)
				this.advance(this.scene, false);
	}
}