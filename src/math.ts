export interface Point {
	x: number;
	y: number;
}

export interface Rectangle extends Point {
	width: number;
	height: number;
}
export function random(min:number, max:number):number {
	return Math.floor(min + Math.random() * (max - min));
}
export function round(num:number, inc:number):number {
	return Math.round(num / inc) * inc;
}
export function randomStep(min:number, max:number, inc:number):number {
	return min + round(random(min, max) - min, inc);
}

export function intersects(s: Rectangle, r: Rectangle, spacing: number): boolean {
	return Math.abs((s.x + s.width / 2) - (r.x + r.width / 2)) < (s.width + r.width) / 2 + spacing
	&& Math.abs((s.y + s.height / 2) - (r.y + r.height / 2)) < (s.height + r.height) / 2 + spacing;
}
export function distSquared(a: Point, b: Point) {
	return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
}
