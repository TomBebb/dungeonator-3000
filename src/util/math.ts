/// A 2d point.
export interface Point {
    x: number;
    y: number;
}

/// A 2d size.
export interface Size {
    width: number;
    height: number;
}

/// A 2d point and set of dimensions.
export interface Rectangle extends Point, Size {
}

/// Make a random integer between `min` and `max`
export function random(min: number, max: number): number {
    return Math.floor(min + Math.random() * (max - min));
}
/// Return a random item in `array`
export function randomIn<T>(array: T[]): T | undefined {
    return array[Math.floor(Math.random() * array.length)]
}
/// Return `num` rounded to the nearest `inc`
export function round(num: number, inc: number): number {
    return Math.round(num / inc) * inc;
}
/// Return a random number between `min` and `max` with the increment `inc`
export function randomStep(min: number, max: number, inc: number): number {
    return min + round(random(min, max) - min, inc);
}
/// Returns true if `a` and `b` are at the same position.
export function pointEq(a: Point, b: Point): boolean {
    return a.x === b.x && a.y === b.y;
}
/// Check if the rectangles `s` and `r` intersect with `spacing` needed between them to be considered intersecting.
export function intersects(s: Rectangle, r: Rectangle, spacing: number): boolean {
    return Math.abs((s.x + s.width / 2) - (r.x + r.width / 2)) < (s.width + r.width) / 2 + spacing
    && Math.abs((s.y + s.height / 2) - (r.y + r.height / 2)) < (s.height + r.height) / 2 + spacing;
}
/// Return the squared distance between `a` and `b`
export function distSquared(a: Point, b: Point) {
    return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
}

/// Compute the Manhattan distance between two points.
export function manhattanDistance(p: Point, g: Point): number {
    return Math.abs(p.x - g.x) + Math.abs(p.y - g.y);
}

/// Return the centre tile of the rectangle `r`.
export function centre(r: Rectangle) : Point {
    return {
        x: r.x + Math.floor(r.width / 2),
        y: r.y + Math.floor(r.height / 2)
    };
}