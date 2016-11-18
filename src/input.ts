import Game from "./Game"; 

export const enum Direction {
	None,
	Left,
	Right,
	Up,
	Down
}
export const enum Button {
    Primary = 0,
    Secondary = 1 << 0,
    Tertiary = 1 << 1
}
export class Input {
	dir: Direction = Direction.None;
	protected buttons: number = 0;
	button(which: Button): boolean {
		return (this.buttons & which) != 0;
	}
	protected updateButton(button: Button, pressed: boolean) {
		if(pressed)
			this.buttons |= button;

	}
	update(dt: number) {

	}
}
export class GamepadInput extends Input {
	private readonly deadzone: number = 0.1;
	private readonly gamepad: Gamepad;
	constructor(gamepad: Gamepad) {
		super();
		this.gamepad = gamepad;
	}
	update(dt: number) {
		const a = this.gamepad.axes;
		const b = this.gamepad.buttons;
		if(b[14] || a[0] < this.deadzone)
			this.dir = Direction.Left;
		else if(b[15] || a[0] > 1 - this.deadzone)
			this.dir = Direction.Right;
		else if(b[12] || a[1] < this.deadzone)
			this.dir = Direction.Up;
		else if(b[13] || a[1] > 1 - this.deadzone)
			this.dir = Direction.Down;
		else
			this.dir = Direction.None;
	}
}
export class KeyboardInput extends Input {
	constructor(game: Game) {
		super();
		let self = this;
		game.canvas.tabIndex = 1;
		game.canvas.onkeydown = function(e: KeyboardEvent) {
			switch(e.keyCode) {
				case 32:
					self.updateButton(0, true);
					break;
				case 18: case 225:
					self.updateButton(1, true);
					break;
				case 37:
					self.dir = Direction.Left;
					break;
				case 38:
					self.dir = Direction.Up;
					break;
				case 39:
					self.dir = Direction.Right;
					break;
				case 40:
					self.dir = Direction.Down;
					break;
			}
		}
		game.canvas.onkeyup = function(e: KeyboardEvent) {
			if(e.keyCode >= 37 && e.keyCode <= 40)
				self.dir = Direction.None;
			else if(e.keyCode == 32)
				self.updateButton(0, false);
			else if(e.keyCode == 18 || e.keyCode == 225)
				self.updateButton(1, false);
		}
	}
	update(dt: number) {

	}
}
const DIRS: [number, number][] = [
	[0, 0],
	[-1, 0],
	[1, 0],
	[0, -1],
	[0, 1]
];
export function toVector(dir: Direction): [number, number] {
	return DIRS[dir];
}