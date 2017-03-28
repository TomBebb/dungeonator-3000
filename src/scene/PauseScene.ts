import Main from '../main';
import Scene from './Scene';
import Graphics = PIXI.Graphics;
import Text = PIXI.Text;
import TitleScene from './TitleScene';
import { InputType } from '../util/input';

/// Displayed when a scene is paused.
export default class PauseScene<T extends Scene> extends Scene {
    readonly scene: T;
    /// The colored overlay that tints the paused sceen.
    private readonly overlay: Graphics = new Graphics();
    /// The paused text.
    private readonly paused: Text = new Text("Paused", {
        align: 'centre',
        fontSize: 60,
        fill: 'white'
    });
    /// The text that shows the input needed to resume the game.
    private readonly detail: Text = new Text("", {
        align: 'centre',
        fontSize: 20,
        fill: 'white'
    });
    /// Set detail text according to last input
    set input(v: InputType) {
        switch(v) {
            case "mouse":
                this.detail.text = "Click to resume";
                break;
            case "gamepad":
                this.detail.text = "Press Start to resume, or Select to exit";
                break;
            default:
                this.detail.text = "Press Enter or Space to resume, or Escape to exit";
        }
        const r = Main.instance.renderer;
        this.detail.position.set((r.width - this.detail.width) / 2, this.paused.y + this.paused.height * 2);
    }
    constructor(scene: T) {
        super();
        const r = Main.instance.renderer;
        this.paused.position.set((r.width - this.paused.width) / 2, (r.height - this.paused.height) / 2);
        this.input = undefined;
        this.scene = scene;
        this.addChild(scene);
        this.addChild(this.overlay);
        this.overlay.beginFill(0, 0.35);
        this.overlay.drawRect(0, 0, r.width, r.height);
        this.overlay.endFill();
        this.addChild(this.paused);
        this.addChild(this.detail);
        this.addEvent("mousedown", this.resume.bind(this));
        this.addEvent("keydown", (e: KeyboardEvent) => {
            if(e.repeat)
                return;
            if(e.keyCode == 27)
                this.advanceTitle();
            else
                this.resume();
        });
        this.cacheAsBitmap = true;
    }
    /// Advane to the title scene.
    private advanceTitle() {
        this.advance(new TitleScene(), true);
    }
    /// Resume the paused scene.
    private resume() {
        this.advance(this.scene, false);
    }
    update(dt: number) {
        super.update(dt);
        // Handle gamepad input
        const gps = navigator.getGamepads();
        for(const gp of gps) {
            // Ignore disconnected / invalid gamepads
            if(gp == null)
                continue;
            if(gp.buttons[8].pressed)
                this.advanceTitle();
            else if(gp.buttons[9].pressed)
                this.resume();
        }
    }
}