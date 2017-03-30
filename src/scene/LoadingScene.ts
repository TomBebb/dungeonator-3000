import Main from '../main';
import Scene from './Scene';
import Text = PIXI.Text;

export default class LoadingScene extends Scene {
    private static readonly DOT_INTERVAL = 0.01;
    private static readonly TEXT = "Loading";
    private sinceAddDot: number = 0;
    private text: Text;
    constructor() {
        super();
        const r = Main.instance.renderer;
        this.text = new Text(LoadingScene.TEXT, {
            align: 'left',
            fontFamily: 'sans',
            fontSize: r.height / 2,
            fill: 'white'
        });
        this.text.x = (r.width - this.text.width) / 2;
        this.text.y = (r.height - this.text.height) / 2;
        this.text.scale.set(1, 1);
        this.cacheAsBitmap = true;
        this.ui.scale.set(1, 1);
        this.addUi(this.text);
    }
    update(dt: number) {
        this.sinceAddDot += dt;
        if (this.sinceAddDot >= LoadingScene.DOT_INTERVAL) {
            this.sinceAddDot -= LoadingScene.DOT_INTERVAL;
            this.cacheAsBitmap = false;
            this.text.text += ".";
            this.cacheAsBitmap = true;
        }
    }
}