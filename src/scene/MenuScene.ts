import Main from '../main';
import Scene from './Scene';
import Button from '../ui/Button';
import UIMap from '../ui/Map';
import Text = PIXI.Text;
import { Rectangle, BaseRectangle } from '../util/geom/Rectangle';
import QuadTree from '../util/geom/QuadTree';

type Input = "mouse" | "keyboard" | "gamepad";

/// Any meny scene
export default class MenuScene extends Scene {
	/// The title text
	readonly title: Text = new Text("", {
		align: 'left',
		fontSize: 60,
		dropShadow: true,
		dropShadowBlur: 5,
		dropShadowDistance: 0,
		fill: 'white'
	});
	private buttonTree: QuadTree<Button>;
	private readonly buttons: Button[];
	/// The map, that is scrolled past
	readonly map: UIMap = new UIMap(128, 128);
	/// Velocity of the camera per second
	readonly vel: [number, number] = [0, 0];

	private selected: number = -1;
	constructor(name: string, buttons: Button[]) {
		super();
		const r = Main.instance.renderer;
		this.buttons = buttons;
		this.title.cacheAsBitmap = true;
		this.title.text = name;
		this.title.position.set(r.width / 2 - this.title.width / 2, 5);
		this.addUi(this.title);

		this.buttonTree = new QuadTree<Button>(new Rectangle(0, 0, r.width, r.height));

		for(let i = 0, button:Button = buttons[0]; i < buttons.length; button = buttons[++i]) {
			button.scale.set(1, 1);
			button.position.set(r.width / 2 - button.width / 2, r.height * 0.95 - (i + 1) * (button.height + 10));
			this.addUi(button);
			this.buttonTree.insert(button);
		}
		const speed = 169;
		this.vel[0] = Math.random() * speed;
		this.vel[1] = Math.sqrt(speed * speed - this.vel[0] * this.vel[0]);
		// Set up buttons and label
		this.addNonUi(this.map);
		this.setCamera(this.map.width / 2, this.map.height / 2);
		// Register event handlers
		this.addEvent("keydown", (e: KeyboardEvent) => {
			if(e.keyCode == 32 || e.keyCode == 13) {
				this.autoAdvance("keyboard");
				return;
			}
			if(this.selected == -1 && e.keyCode == 38 || e.keyCode == 40)
				this.selected = 0;
			this.buttons[this.selected].selected = false;
			if(e.keyCode == 38 && this.selected > 0)
				this.selected--;
			else if(e.keyCode == 40 && this.selected < this.buttons.length - 1) 
				this.selected++;
			if(e.keyCode == 38 || e.keyCode == 40)
				this.buttons[this.selected].selected = true;
		});
		this.addEvent("mousedown", (_: MouseEvent) => this.autoAdvance("mouse"));
		this.addEvent("mousemove", (e: MouseEvent) => {
			const a: Button[] = [];
			const eR = e as any as BaseRectangle;
			eR.width = 1;
			eR.height = 1;
			this.buttonTree.retrieve(a, eR);
			const btn:Button | undefined = a.find((b) => b.containsPoint(e));
			for(const btn2 of a)
				if(btn2.selected && btn2 != btn)
					btn2.selected = false;
			if(btn != null) {
				btn.selected = true;
				this.selected = this.buttons.indexOf(btn);
			} else {
				this.selected = -1;
			}
		});
	}
	private autoAdvance(input: Input) {
		if(this.selected != -1)
			this.advance(this.buttons[this.selected].listener(input), false);
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
						this.autoAdvance("gamepad");
	}
}