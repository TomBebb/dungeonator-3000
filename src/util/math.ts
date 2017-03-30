/// Make a random integer between `min` and `max`
export function random(min: number, max: number): number {
    return Math.floor(min + Math.random() * (max - min));
}
/// Return a random item in `array`
export function randomIn<T>(array: T[]): T | undefined {
    return array[Math.floor(Math.random() * array.length)]
}
/// Force v to fit in the range `min <= v <= max`
export function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(v, max));
}
/// Return `num` rounded to the nearest `inc`
export function round(num: number, inc: number): number {
    return Math.round(num / inc) * inc;
}
/// Return a random number between `min` and `max` with the increment `inc`
export function randomStep(min: number, max: number, inc: number): number {
    return min + round(random(min, max) - min, inc);
}

/// Check if rectangles intersect
export function intersects(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number, spacing: number): boolean {
    return Math.abs((x1 + w1 / 2) - (x2 + w2 / 2)) < (w1 + w2) / 2 + spacing
        && Math.abs((y1 + h1 / 2) - (y2 + h2 / 2)) < (h1 + h2) / 2 + spacing;
}

/// Calculate the manhattan distance between two points
export function manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
/// Check if the rectangle contains a point
export function rectContains(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number): boolean {
    return Math.abs(x1 + w1 / 2 - x2) < w1 / 2 && Math.abs(y1 + h1 / 2 - y2) < h1;
}
/// Check if the rectangle contains a rectangle
export function rectContainsRect(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number): boolean {
    return x2 > x1 && y2 > y1 && x2 + w2 < x1 + w1 && y2 + h2 < y1 + h1;
}