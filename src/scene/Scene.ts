/// A common interface for scenes.
///
/// The PIXI layer takes care of rendering.
class Scene extends PIXI.Container {
	constructor(bg: number) {
		super();
		bg;
	}
	/// Update this scene with the delta time `dt` (in seconds).
	update(dt: number): void {
		dt;
	}
}
export default Scene;