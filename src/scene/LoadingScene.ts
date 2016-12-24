import Main from '../main';
import Container = PIXI.Container;
import Graphics = PIXI.Graphics;
import Text = PIXI.Text;

export default class LoadingScene extends Container {
	static readonly TEXT = "Loading";
	readonly graphics: Graphics;
	constructor() {
		super();
		this.addChild(new Text(LoadingScene.TEXT, {
			align: 'center',
			fontFamily: 'sans',
			fontSize: 8,
			fill: 'white'
		}));
		this.graphics = new Graphics();
		this.addChild(this.graphics);
		PIXI.loader.on("progress", () => {
			this.graphics.beginFill(0xFFFFFF);
			const p = PIXI.loader.progress;
			this.graphics.drawRect(0, this.height / 2, p * this.width, 20);
		});
	}
	update(dt: number): void {
	}
}