import Container = PIXI.Container;
import DisplayObject = PIXI.DisplayObject;
import { BasePoint, Point } from '../util/geom/Point';
import Main from "../main";
/// A common interface for scenes.
///
/// The PIXI layer takes care of rendering.
class Scene extends PIXI.Container {
	ui: Container = new Container();
	nonUi: Container = new Container();
	constructor() {
		super();
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
	removeNonUi(elem: DisplayObject) {
		this.nonUi.removeChild(elem);
	}
	setCamera(x: number, y: number) {
		this.nonUi.pivot.set(x, y);
	}
	getCamera(): BasePoint {
		return this.nonUi.pivot;
	}
	fromGlobal(p: BasePoint): Point {
		const r = Main.instance.renderer, c = this.getCamera();
		return new Point(c.x - r.width / 2 + p.x, c.y - r.height / 2 + p.y);
	}
	/// Update this scene with the delta time `dt` (in seconds).
	update(dt: number): void {
		dt;
	}
}
export default Scene;