import Point from "./Point";
import {intersects} from "../math";

/// A 2d point and set of dimensions.
export default class Rectangle extends Point {
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
        return intersects(this.x, this.y, this.width, this.height, other.x, other.y, other.width, other.height, spacing);
    }
}