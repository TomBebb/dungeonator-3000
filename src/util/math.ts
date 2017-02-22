export interface BasePoint {
    x: number;
    y: number;
}

/// A 2d point.
export class Point implements BasePoint {
    x: number;
    y: number;
    constructor(x: number = 0, y: number = 0) {
        this.set(x, y);
    }
    set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    hash(): number {
        return (this.x << 16) | (this.y & 0xFFFF);
    }
    equals(other: BasePoint): boolean {
        return this.x === other.x && this.y === other.y;
    }
    static from(p: BasePoint): Point {
        Object.setPrototypeOf(p, Point.prototype);
        return p as Point;
    }
    /// Return the squared distance between this and another point.
    distSquared(other: BasePoint): number {
        return Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2);
    }

    /// Compute the Manhattan distance between two points.
    manhattanDistance(other: BasePoint): number {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
    }
}


/// A 2d point and set of dimensions.
export class Rectangle extends Point {
    width: number;
    height: number;
    constructor(x: number, y: number, w: number, h: number) {
        super(x, y);
        this.width = w;
        this.height = h;
    }
    

    /// Return the centre tile of the rectangle `r`.
    get centre(): Point {
        return new Point(
            this.x + Math.floor(this.width / 2),
            this.y + Math.floor(this.height / 2)
        );
    }
    /// Check if the rectangles `s` and `r` intersect with `spacing` needed between them to be considered intersecting.
    intersects(other: Rectangle, spacing: number): boolean {
        return Math.abs((this.x + this.width / 2) - (other.x + other.width / 2)) < (this.width + other.width) / 2 + spacing
        && Math.abs((this.y + this.height / 2) - (other.y + other.height / 2)) < (this.height + other.height) / 2 + spacing;
    }
}

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