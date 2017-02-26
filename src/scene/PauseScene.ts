import Main from '../main';
import Scene from './Scene';
import Graphics = PIXI.Graphics;

export default class PauseScene extends Scene {
	readonly scene: Scene;
	readonly overlay: Graphics = new Graphics();
	constructor(scene: Scene) {
		super();
		this.scene = scene;
		const r = Main.instance.renderer;
		this.addChild(scene);
		this.addChild(this.overlay);
		this.overlay.beginFill(0, 0.15);
		this.overlay.drawRect(0, 0, r.width, r.height);
		this.overlay.endFill();
		this.overlay.beginFill(0xffffffff, 1);
		const cx = r.width / 2, cy = r.height / 2;
		const rd = 50;
		this.overlay.drawPolygon([cx - rd, cy - rd, cx - rd, cy - rd, cx + rd, cy ]);
		this.overlay.endFill();
		r.view.onmousedown = () => this.advance();
	}
	advance() {
		const r = Main.instance.renderer;
		Main.instance.scene = this.scene;
		r.view.onmousedown = undefined as any;
	}
}