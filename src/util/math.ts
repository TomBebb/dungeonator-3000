/// Make a random integer between `min` and `max`
export function random(min: number, max: number): number {
    return Math.floor(min + Math.random() * (max - min));
}
/// Return a random item in `array`
export function randomIn<T>(array: T[]): T | undefined {
    return array[Math.floor(Math.random() * array.length)]
}
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