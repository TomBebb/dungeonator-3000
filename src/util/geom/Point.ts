import BasePoint from "./BasePoint";

/// A 2d point.
export default class Point implements BasePoint {
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
    static from(p: BasePoint, copy: boolean = false, scale: number = 1): Point {
        if(copy)
            p = new Point(p.x, p.y);
        else
            Object.setPrototypeOf(p, Point.prototype);
        p.x *= scale;
        p.y *= scale;
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