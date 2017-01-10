/// A common interface for scenes.
///
/// The PIXI layer takes care of rendering.
interface Scene extends PIXI.Container {
	/// Update this scene with the delta time `dt` (in seconds).
	update(dt: number): void;
}
export default Scene;