import Main from '../main';
import Scene from './Scene';
import Button from '../ui/Button';
import UIMap from '../ui/Map';
import PlayScene from './PlayScene';
import {Save, load} from '../util/save';
import Text = PIXI.Text;
import { Rectangle, BaseRectangle } from '../util/geom/Rectangle';
import QuadTree from '../util/geom/QuadTree';
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
	private buttonTree: QuadTree<Button>;
	private buttons: Map<Button, (_:"mouse" | "keyboard" | "gamepad") => Scene> = new Map();
	/// The map, that is scrolled past
	readonly map: UIMap = new UIMap(128, 128);
	/// Velocity of the camera per second
	readonly vel: [number, number] = [0, 0];
	constructor() {
		super();
		const r = Main.instance.renderer;
		this.buttonTree = new QuadTree<Button>(new Rectangle(0, 0, r.width, r.height));
		this.title.width = r.width;
		this.title.height = r.height;
		this.title.cacheAsBitmap = true;
		const speed = 169;
		this.vel[0] = Math.random() * speed;
		this.vel[1] = Math.sqrt(speed * speed - this.vel[0] * this.vel[0]);
		// Set up buttons and label
		this.addNonUi(this.map);
		this.title.scale.set(1, 1);
		this.addUi(this.title);
		const play: Button = new Button('Play', 0xffffff, 'black');
		play.scale.set(1, 1);
		play.position.set(r.width / 2 - play.width / 2, r.height * 0.75 - play.height / 2);
		this.addUi(play);
		this.buttons.set(play, (input) => new PlayScene(input));
		this.buttonTree.insert(play);
		this.title.position.set(r.width / 2 - this.title.width / 2, r.height / 4 - this.title.height / 2);
		this.setCamera(this.map.width / 2, this.map.height / 2);
		const data: Save | undefined = load();
		if(data != undefined) {
			const t = new Text(`Highest floor: ${data.maxFloor}`, {
				fontSize: 40,
				fill: 'white'
			});
			t.position.set((r.width - t.width) / 2, (r.height - t.height) / 2);
			t.cacheAsBitmap = true;
			this.addUi(t);
		}
		// Register event handlers
		this.addEvent("keydown", (e: KeyboardEvent) => {
			if(e.keyCode == 32 || e.keyCode == 13)
				this.advance(new PlayScene("keyboard"));
		});
		this.addEvent("mousedown", (e: MouseEvent) => {
			const a: Button[] = [];
			const eR = e as any as BaseRectangle;
			eR.width = 1;
			eR.height = 1;
			this.buttonTree.retrieve(a, eR);
			const btn = a.find((b) => b.containsPoint(e));
			if(btn != null)
				this.advance(this.buttons.get(btn)!("mouse"));
		});
		this.addEvent("mousemove", (e: MouseEvent) => {
			const a: Button[] = [];
			const eR = e as any as BaseRectangle;
			eR.width = 1;
			eR.height = 1;
			this.buttonTree.retrieve(a, eR);
			const btn = a.find((b) => b.containsPoint(e));
			r.view.style.cursor = btn != null ? 'pointer' : 'default';
		});
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
		const gs = navigator.getGamepads();
		// Advance on any button.
		for(const g of gs)
			if(g && g.buttons)
				for(let b = 0; b < g.buttons.length; b++)
					if(g.buttons[b].pressed)
						this.advance(new PlayScene("gamepad"));
	}
}