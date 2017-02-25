import Container = PIXI.Container;
import DisplayObject = PIXI.DisplayObject;
import Main from "../main";
/// A common interface for scenes.
///
/// The PIXI layer takes care of rendering.
class Scene extends PIXI.Container {
	ui: Container = new Container();
	nonUi: Container = new Container();
	constructor(bg: number) {
		super();
		bg;
		this.addChild(this.nonUi);
		this.addChild(this.ui);
		const r = Main.instance.renderer;
		this.nonUi.position.set(r.width / 2, r.height / 2);
	}
	addUi(elem: DisplayObject) {
		this.ui.addChild(elem);
	}
	addNonUi(elem: DisplayObject) {
		this.nonUi.addChild(elem);
	}
	setCamera(x: number, y: number) {
		this.nonUi.pivot.set(x, y);
	}
	/// Update this scene with the delta time `dt` (in seconds).
	update(dt: number): void {
		dt;
	}
}
export default Scene;