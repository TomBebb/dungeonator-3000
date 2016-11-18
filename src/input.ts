import Game from "./Game";
import { random } from "./math";

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
export interface Input {
	dir: Direction;
	button(_: Button): boolean;
	update(_: number): void;
}
export class BasicInput implements Input {
	dir: Direction = Direction.None;
	private buttons: number = 0;
	button(which: Button): boolean {
		return (this.buttons & which) != 0;
	}
	protected updateButton(button: Button, pressed: boolean) {
		if (pressed)
			this.buttons |= button;
		else
			this.buttons = (this.buttons | button) ^ button;

	}
	update(_: number) { }
}
export class RandomInput implements Input {

	constructor() {
	}

	button(_: Button) {
		return false;
	}

	get dir(): Direction {
		return random(Direction.None, Direction.Down + 1);
	}
	update(_: number) { }
}
export class GamepadInput implements Input {
	private readonly deadzone: number = 0.1;
	private readonly gamepad: Gamepad;
	constructor(gamepad: Gamepad) {
		this.gamepad = gamepad;
	}
	get index(): number {
		return this.gamepad.index;
	}
	button(which: Button): boolean {
		return this.gamepad.buttons[which].pressed;
	}
	get dir() {
		const a = this.gamepad.axes;
		const b = this.gamepad.buttons;
		if (b[14].pressed || a[0] < this.deadzone)
			return Direction.Left;
		else if (b[15].pressed || a[0] > 1 - this.deadzone)
			return Direction.Right;
		else if (b[12].pressed || a[1] < this.deadzone)
			return Direction.Up;
		else if (b[13].pressed || a[1] > 1 - this.deadzone)
			return Direction.Down;
		else
			return Direction.None;
	}
	update(_: number) {
	}
}
export class KeyboardInput extends BasicInput {
	constructor(game: Game) {
		super();
		let self = this;
		game.canvas.tabIndex = 1;
		game.canvas.onkeydown = function(e: KeyboardEvent) {
			switch (e.keyCode) {
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
			if (e.keyCode >= 37 && e.keyCode <= 40)
				self.dir = Direction.None;
			else if (e.keyCode == 32)
				self.updateButton(0, false);
			else if (e.keyCode == 18 || e.keyCode == 225)
				self.updateButton(1, false);
		}
	}
	update(_: number) {

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