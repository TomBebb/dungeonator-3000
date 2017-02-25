import Container = PIXI.Container;
import PText = PIXI.Text;
import Graphics = PIXI.Graphics;
export default class Button extends Container {
    private bg: Graphics = new Graphics();
    private label: PText = new PText("", {
		align: 'center',
		fontSize: 40,
		dropShadow: true,
		dropShadowBlur: 5,
		dropShadowDistance: 0
    });
    constructor(name: string, bg: number, fg: string, w: number = 200, h: number = 60) {
        super();
        this.label.style.fill = fg;
        this.label.text = name;
        this.addChild(this.bg);
        this.bg.beginFill(bg);
        this.bg.drawRoundedRect(0, 0, w, h, 8);
        this.bg.endFill();
        this.label.x = (w - this.label.width) / 2;
        this.label.y = (h - this.label.height) / 2;
        this.addChild(this.label);
        this.cacheAsBitmap = true;
    }
}