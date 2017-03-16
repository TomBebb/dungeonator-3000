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

	private readonly events: Map<string, any> = new Map();
	constructor() {
		super();
		this.addChild(this.nonUi);
		this.addChild(this.ui);
		const r = Main.instance.renderer;
		this.nonUi.position.set(r.width / 2, r.height / 2);
	}
	/// Add a 'ui' child (that isn't affected by the camera)
	addUi(elem: DisplayObject) {
		this.ui.addChild(elem);
	}
	/// Add a 'non ui' child (that is affected by the camera)
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
	/// Advance to a scene (play scene by default)
	advance(scene: Scene, destructive: boolean = true) {
		const r = Main.instance.renderer;
		r.view.style.cursor = 'default';
		Main.instance.scene = scene;
		if(destructive)
			this.destroy();
	}
	destroy() {
		super.destroy();
		const events = this.events.keys();
		let v;
		while(!(v = events.next()).done) {
			const k = v.value;
			window.removeEventListener(k, this.events.get(k));
		}
	}
	/// Register an event listener that will be unset when this closes.
	addEvent(name: string, cb: any) {
		window.addEventListener(name, cb);
		this.events.set(name, cb);
	}
}
export default Scene;