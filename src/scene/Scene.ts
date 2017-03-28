import Container = PIXI.Container;
import DisplayObject = PIXI.DisplayObject;
import { BasePoint, Point } from '../util/geom/Point';
import Main from "../main";

/// A common base class for scenes (the object other objects are placed on).
///
/// The PIXI layer takes care of rendering.
class Scene extends Container {
	/// The container used for UI (floating) elements.
	protected ui: Container = new Container();
	/// The container used for non-UI (not floating) elements.
	protected nonUi: Container = new Container();

	/// A map of strings to event listeners.
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
	/// Set the camera positon
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
	/// 
	/// The `destructive` argument decides whether resources are freed
	/// and events  in addition to advancing the scene.
	advance(scene: Scene, destructive: boolean = true) {
		const r = Main.instance.renderer;
		r.view.style.cursor = 'default';
		Main.instance.scene = scene;
		if(destructive)
			this.destroy();
	}
	/// Release this scene's resources and unregister events set by this.
	destroy() {
		super.destroy();
		const events = this.events.keys();
		let v;
		while(!(v = events.next()).done) {
			const k = v.value;
			window.removeEventListener(k, this.events.get(k));
		}
	}
	/// Register an event listener that will be unset when (if) this
	/// scene is destroyed.
	addEvent(name: string, cb: any) {
		window.addEventListener(name, cb);
		this.events.set(name, cb);
	}
	/// Remove an event listener by its name.
	removeEvent(name: string) {
		const cb = this.events.get(name)!;
		this.events.delete(name);
		window.removeEventListener(name, cb);
	}
}
export default Scene;