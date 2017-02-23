import Main from '../main';
import Scene from './Scene';
import Text = PIXI.Text;

export default class TitleScene extends Scene {
	readonly title: Text = new Text("Dungeon game", {
		align: 'center',
		fontFamily: 'sans',
		fontSize: Main.instance.renderer.height / 16,
		fill: 'white'
	});
	constructor() {
		super(0xc0c0c0);
		const r = Main.instance.renderer;
		this.title.y = 0;
		this.title.width = r.width;
		this.title.height = r.height;
		this.addChild(this.title);
	}
	update(dt: number): void {
		if(this.title.y < Main.instance.renderer.height / 2)
			this.title.y += dt * 10;
	}
}