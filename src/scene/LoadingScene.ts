import Scene from './Scene';
import Main from '../main';

export default class LoadingScene implements Scene {
	static readonly TEXT = "Loading";

	constructor() {

	}
	get progress(): number {
		return Main.instance.assets.progress;
	}
	render(c: CanvasRenderingContext2D): void {
		c.fillStyle = 'gray';
		const [w, h] = [c.canvas.width, c.canvas.height];
		c.fillRect(0, 0, w, h);
		c.fillStyle = 'white';
		c.font = '20px sans';
		const tw = c.measureText(LoadingScene.TEXT);
		c.fillText(LoadingScene.TEXT, (w - tw.width) / 2, (h - 20) / 2);
		c.fillRect(0, h - 40, this.progress * w, 20);
	}
	update(_: number): void {

	}
}