import {BasePoint, Point} from "./Point";
import {intersects, rectContains} from "../math";

/// A 2d rectangle.
export interface BaseRectangle extends BasePoint {
    /// The width of this rectangle
    width: number,
    /// The height of this rectangle
    height: number
}

/// A 2d point and set of dimensions.
export class Rectangle extends Point implements BaseRectangle {
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
    /// Determine if this rectangle contains the point (`x`, `y`)
    contains(x: number, y: number): boolean {
        return rectContains(this.x, this.y, this.width, this.height, x, y);
    }
    /// Check if the rectangles `s` and `r` intersect with `spacing` 'leeway'
    intersects(other: Rectangle, spacing: number): boolean {
        return intersects(this.x, this.y, this.width, this.height, other.x, other.y, other.width, other.height, spacing);
    }
}