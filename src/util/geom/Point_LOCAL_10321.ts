import Hash from '../ds/Hash';

/// A structural interface to represent a 2D point.
export interface BasePoint {
    /// The x co-ordinate of this point.
    x: number;
    /// The y co-ordinate of this point.
    y: number;
}

/// A 2d point.
export class Point implements BasePoint, Hash {
    x: number;
    y: number;
    constructor(x: number = 0, y: number = 0) {
        this.set(x, y);
    }
    /// Set the x and y co-ordinates.
    set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    /// Compute a 32-bit hash of this point by storing the `x` in the leftmost
    /// 16 bits, and the `y` in the rightmost 16 bits.
    ///
    /// This assumes x and y can actually be represented by 16-bit integers.
    /// Unfortunately, TypeScript has no distinction between floating-point
    /// numbers and integer numbers, so this can't be enforced by the type
    /// system itself.
    hash(): number {
        return (this.x << 16) | (this.y & 0xFFFF);
    }
    /// Return true when a and b have the same co-ordinates.
    static eq(a: BasePoint, b: BasePoint): boolean {
        return a.x === b.x && a.y === b.y;
    }
    /// Return true when this point and `other` have the same co-ordinates.
    equals(other: BasePoint): boolean {
        return Point.eq(this, other);
    }
    /// If `copy` is true, make a new point with same co-ordinates.
    /// If `copy` is false, make `p` into a point.
    /// Scale this point by `scale`.
    static from(p: BasePoint, copy: boolean = false, scale: number = 1): Point {
        if (copy)
            // Duplicate `p`
            p = new Point(p.x, p.y);
        else
            // Force `p` to be an instance of `Point`
            Object.setPrototypeOf(p, Point.prototype);
        p.x = Math.floor(p.x * scale);
        p.y = Math.floor(p.y * scale);
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