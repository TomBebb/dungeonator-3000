import Main from '../main';
import Scene from './Scene';
import Text = PIXI.Text;

export default class CreditsScene extends Scene {
	private static readonly TEXT = "Programming: Tom Bebbington\nCoding: Tom Bebbington";
	private text: Text;
	private from: Scene;
	constructor(from: Scene) {
		super();
		this.from = from;
		const r = Main.instance.renderer;
		this.text = new Text(CreditsScene.TEXT, {
			align: 'left',
			fontFamily: 'sans',
			fontSize: 30,
			wordWrap: true,
			fill: 'white',
			wordWrapWidth: r.width - 20,
			lineHeight: 50
		});
		this.text.x = (r.width - this.text.width) / 2;
		this.text.y = r.height;
		this.text.scale.set(1, 1);
		this.text.cacheAsBitmap = true;
		this.ui.scale.set(1, 1);
		this.addUi(this.text);
	}
	update(dt: number) {
		this.text.y -= dt * 20;
		if(this.text.y + this.text.height < 0) {
			this.advance(this.from);
		}
	}
}