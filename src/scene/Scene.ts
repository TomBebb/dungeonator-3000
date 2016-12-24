import Camera from "../Camera";
interface Scene extends PIXI.Container {
	readonly camera?: Camera;
	update(dt: number): void;
}
export default Scene;