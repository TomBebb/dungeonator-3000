interface Scene {
	render(ctx: CanvasRenderingContext2D): void;
	update(dt: number): void;
}
export default Scene;