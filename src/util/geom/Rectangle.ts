import { BasePoint, Point } from "./Point";
import { intersects, rectContains, rectContainsRect } from "../math";

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
        return new Point(this.centreX, this.centreY);
    }
    /// Get y-coordinate of top of rectangle
    get top(): number {
        return this.y;
    }
    /// Get y-coordinate of centre of rectangle
    get centreY(): number {
        return this.y + Math.floor(this.height / 2);
    }
    /// Get y-coordinate of bottom of rectangle
    get bottom(): number {
        return this.y + this.height;
    }
    /// Get x-coordinate of left of rectangle
    get left(): number {
        return this.x;
    }
    /// Get x-coordinate of centre of rectangle
    get centreX(): number {
        return this.x + Math.floor(this.width / 2);
    }
    /// Get x-coordinate of right of rectangle
    get right(): number {
        return this.x + this.width;
    }
    /// Determine if this rectangle contains the point (`x`, `y`)
    contains(x: number, y: number): boolean {
        return rectContains(this.x, this.y, this.width, this.height, x, y);
    }
    containsRect(other: BaseRectangle): boolean {
        return rectContainsRect(this.x, this.y, this.width, this.height, other.x, other.y, other.width, other.height);
    }
    /// Check if the rectangles `s` and `r` intersect with `spacing` 'leeway'
    intersects(other: BaseRectangle, spacing: number): boolean {
        return intersects(this.x, this.y, this.width, this.height, other.x, other.y, other.width, other.height, spacing);
    }
}