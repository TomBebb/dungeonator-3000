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
export function round(num: number, inc: number): number {
    return Math.round(num / inc) * inc;
}
export function randomStep(min: number, max: number, inc: number): number {
    return min + round(random(min, max) - min, inc);
}
/// Check if the rectangles `s` and `r` intersect with `spacing` needed between them to be considered intersecting.
export function intersects(s: Rectangle, r: Rectangle, spacing: number): boolean {
    return Math.abs((s.x + s.width / 2) - (r.x + r.width / 2)) < (s.width + r.width) / 2 + spacing
    && Math.abs((s.y + s.height / 2) - (r.y + r.height / 2)) < (s.height + r.height) / 2 + spacing;
}
export function distSquared(a: Point, b: Point) {
    return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
}
