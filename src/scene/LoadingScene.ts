import Main from '../main';
import Container = PIXI.Container;
import Graphics = PIXI.Graphics;
import Text = PIXI.Text;

export default class LoadingScene extends Container {
	static readonly TEXT = "Loading";
	readonly graphics: Graphics;
	constructor() {
		super();
		const r = Main.instance.renderer;
		const text = new Text(LoadingScene.TEXT, {
			align: 'center',
			fontFamily: 'sans',
			fontSize: r.height / 16,
			fill: 'white'
		});
		text.width = r.width;
		text.height = r.height;
		this.addChild(text);
	}
	update(_: number): void {
	}
}