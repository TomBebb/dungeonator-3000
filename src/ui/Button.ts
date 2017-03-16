///<reference path='../pixi.d.ts'/>
import Container = PIXI.Container;
import PText = PIXI.Text;
import Graphics = PIXI.Graphics;
import Scene from '../scene/Scene';
import { BasePoint } from '../util/geom/Point';
import {rectContains} from '../util/math';


type Input = "mouse" | "keyboard" | "gamepad";
type Listener = (_:Input) => Scene;

export default class Button extends Container {
    private bg: Graphics = new Graphics();
    private label: PText = new PText("", {
		align: 'center',
		fontSize: 40,
		dropShadow: true,
		dropShadowBlur: 5,
		dropShadowDistance: 0
    });
    private selectedBg: number;
    private normalBg: number;
    destructive: boolean;
    listener: Listener;
    constructor(name: string, listener: Listener, destructive: boolean = true, bg: number = 0xFFFFFF, selectBg: number = 0xC0C0C0, fg: string = 'black', w: number = 200, h: number = 60) {
        super();
        this.destructive = destructive;
        this.listener = listener;
        this.label.style.fill = fg;
        this.label.text = name;
        this.addChild(this.bg);
        this.bg.beginFill(0xFFFFFFFF);
        this.bg.drawRoundedRect(0, 0, w, h, 8);
        this.bg.endFill();
        this.bg.tint = bg;
        this.normalBg = bg;
        this.selectedBg = selectBg;
        this.label.x = (w - this.label.width) / 2;
        this.label.y = (h - this.label.height) / 2;
        this.addChild(this.label);
        this.cacheAsBitmap = true;
    }
    get selected(): boolean {
        return this.bg.tint == this.selectedBg;
    }

    set selected(s: boolean) {
        this.cacheAsBitmap = false;
        this.bg.tint = s ? this.selectedBg : this.normalBg;
        this.cacheAsBitmap = true;
    }

    containsPoint(p: BasePoint) {
        return rectContains(this.x, this.y, this.width, this.height, p.x, p.y);
    }
}