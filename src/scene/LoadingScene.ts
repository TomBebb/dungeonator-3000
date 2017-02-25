import Main from '../main';
import Scene from './Scene';
import Graphics = PIXI.Graphics;
import Text = PIXI.Text;

export default class LoadingScene extends Scene {
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
		this.addUi(text);
		this.width = r.width;
		this.height = r.height;
	}
}