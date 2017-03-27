import Main from '../main';
import Scene from './Scene';
import Graphics = PIXI.Graphics;
import Text = PIXI.Text;
import TitleScene from './TitleScene';
import { InputType } from '../util/input';

export default class PauseScene extends Scene {
	readonly scene: Scene;
	private readonly overlay: Graphics = new Graphics();
	private readonly paused: Text = new Text("Paused", {
		align: 'centre',
		fontSize: 60,
		fill: 'white'
	});
	private readonly detail: Text = new Text("", {
		align: 'centre',
		fontSize: 20,
		fill: 'white'
	});
	set input(v: InputType) {
		switch(v) {
			case "mouse":
				this.detail.text = "Click to resume";
				break;
			case "gamepad":
				this.detail.text = "Press Start to resume, or Select to exit";
				break;
			default:
				this.detail.text = "Press Enter or Space to resume, or Escape to exit";
		}
		const r = Main.instance.renderer;
		this.detail.position.set((r.width - this.detail.width) / 2, this.paused.y + this.paused.height * 2);
	}
	constructor(scene: Scene) {
		super();
		const r = Main.instance.renderer;
		this.paused.position.set((r.width - this.paused.width) / 2, (r.height - this.paused.height) / 2);
		this.input = undefined;
		this.scene = scene;
		this.addChild(scene);
		this.addChild(this.overlay);
		this.overlay.beginFill(0, 0.35);
		this.overlay.drawRect(0, 0, r.width, r.height);
		this.overlay.endFill();
		this.addChild(this.paused);
		this.addChild(this.detail);
		this.addEvent("mousedown", this.resume.bind(this));
		this.addEvent("keydown", (e: KeyboardEvent) => {
			if(e.repeat)
				return;
			if(e.keyCode == 27)
				this.advanceTitle();
			else
				this.resume();
		});
		this.cacheAsBitmap = true;
	}
	private advanceTitle() {
		this.advance(new TitleScene(), true);
	}
	private resume() {
		this.advance(this.scene, false);
	}
	update(dt: number) {
		super.update(dt);
		const gps = navigator.getGamepads();
		for(const gp of gps) {
			if(gp == null)
				continue;
			if(gp.buttons[8].pressed)
				this.advanceTitle();
			else if(gp.buttons[9].pressed)
				this.resume();
		}
	}
}