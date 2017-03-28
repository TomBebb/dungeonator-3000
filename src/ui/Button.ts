///<reference path='../pixi.d.ts'/>
import Container = PIXI.Container;
import PText = PIXI.Text;
import Graphics = PIXI.Graphics;
import Scene from '../scene/Scene';
import { BasePoint } from '../util/geom/Point';
import {rectContains} from '../util/math';

/// A button listener.
type Listener = () => Scene;

/// A button, a label with a box that links to a diff
export default class Button extends Container {
    /// The graphics instance to draw the background on.
    private bg: Graphics = new Graphics();
    /// The label that displays this buttons's text.
    private label: PText = new PText("", {
        align: 'center',
        fontSize: 40,
        dropShadow: true,
        dropShadowBlur: 5,
        dropShadowDistance: 0
    });
    /// The color this button's background will be while selected.
    private selectedBg: number;
    /// The color this button's background will be while not selected.
    private normalBg: number;
    /// Indicates whether advancing to the scene this links to should destroy the current scene.
    destructive: boolean;
    /// A function given by the scene to construct the new scene.
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
    /// Check if this button is selected.
    get selected(): boolean {
        // Return true when the background color is the same as the selected background color.
        return this.bg.tint == this.selectedBg;
    }

    /// Select / deselect this button.
    set selected(s: boolean) {
        this.cacheAsBitmap = false;
        this.bg.tint = s ? this.selectedBg : this.normalBg;
        this.cacheAsBitmap = true;
    }

    /// Return true when this button contains `p`.
    containsPoint(p: BasePoint): boolean {
        return rectContains(this.x, this.y, this.width, this.height, p.x, p.y);
    }
}