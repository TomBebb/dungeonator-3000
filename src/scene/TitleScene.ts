import Main from '../main';
import Scene from './Scene';
import Button from '../ui/Button';
import Map from '../ui/Map';
import PlayScene from './PlayScene';
import Text = PIXI.Text;
/// The title scene, shown when the game loads
export default class TitleScene extends Scene {
	/// The title text
	readonly title: Text = new Text("Dungeonator 3000", {
		align: 'left',
		fontSize: 60,
		dropShadow: true,
		dropShadowBlur: 5,
		dropShadowDistance: 0,
		fill: 'white'
	});
	readonly play: Button = new Button('Play', 0xffffff, 'black');
	/// The map, that is scrolled past
	readonly map: Map = new Map(128, 128);
	/// Velocity of the camera per second
	readonly vel: [number, number] = [128, -32];
	constructor() {
		super();
		const r = Main.instance.renderer;
		this.title.width = r.width;
		this.title.height = r.height;
		// Set up buttons and label
		this.addNonUi(this.map);
		this.title.scale.set(1, 1);
		this.addUi(this.title);
		this.play.scale.set(1, 1);
		this.play.position.set(r.width / 2 - this.play.width / 2, r.height * 0.75 - this.play.height / 2);
		this.addUi(this.play);
		this.title.position.set(r.width / 2 - this.title.width / 2, r.height / 4 - this.title.height / 2);
		this.setCamera(this.map.width / 2, this.map.height / 2);
		// register click handler for play button
		r.view.onmousedown = (e: MouseEvent) => {
			if(this.play.containsPoint(e)) {
				r.view.onmousedown = undefined as any;
				r.view.onmousemove = undefined as any;
				r.view.style.cursor = 'default';
				Main.instance.scene = new PlayScene();
			}
		};
		r.view.onmousemove = (e: MouseEvent) => {
			r.view.style.cursor = this.play.containsPoint(e) ? 'pointer' : 'default';
		}
	}
	update(dt: number) {
		const c = this.getCamera();
		const r = Main.instance.renderer;
		c.x += this.vel[0] * dt;
		c.y += this.vel[1] * dt;
		if(c.x < r.width / 2)
			this.vel[0] = Math.abs(this.vel[0])
		else if(c.x > this.map.width - r.width / 2)
			this.vel[0] = -Math.abs(this.vel[0])
		if(c.y < r.height / 2)
			this.vel[1] = Math.abs(this.vel[1])
		else if(c.y > this.map.height - r.height / 2)
			this.vel[1] = -Math.abs(this.vel[1])
	}
}