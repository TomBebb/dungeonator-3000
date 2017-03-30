import { BaseRectangle, Rectangle } from './Rectangle';
import { intersects } from '../math';
/// A quad tree, a kind of binary tree where each node has exactly 4 children, and is used
/// to reduce the number of checks done in collision checking by splitting an area
/// into 4 quadrants if it as more than a set number of objects insde it.
///
/// Based on http://algs4.cs.princeton.edu/92search/QuadTree.java.html
/// But ported to TypeScript and given descriptive generic
export default class QuadTree<P extends BaseRectangle> {
    /// The maximum number of nodes to each 
    private static readonly MAX_NODES: number = 4;
    /// The maximum number of layers the quad tree can have.
    private static readonly MAX_DEPTH: number = 4;
    /// The bounding box of this quadtree.
    readonly bounds: Rectangle;
    /// The number of layers the quad tree can have.
    private depth: number;
    /// The quad tree in the top left quartile.
    private topLeft: QuadTree<P> | undefined;
    /// The quad tree in the top right quartile.
    private topRight: QuadTree<P> | undefined;
    /// The quad tree in the bottom left quartile.
    private bottomLeft: QuadTree<P> | undefined;
    /// The quad tree in the bottom right quartile.
    private bottomRight: QuadTree<P> | undefined;
    /// Objects this quadtree is holding
    private objects: P[] = [];
    constructor(bounds: Rectangle, depth: number = 0) {
        this.bounds = bounds;
        this.depth = depth;
    }
    /// Clear this tree of nodes and objects
    clear(): void {
        // Delete referenced quad trees
        this.topLeft = undefined;
        this.topRight = undefined;
        this.bottomLeft = undefined;
        this.bottomRight = undefined;
        // Clear objects from array.
        this.objects.splice(0);
        // Set depth to 0
        this.depth = 0;
    }
    /// Insert an object
    insert(p: P): boolean {
        // Ignore objects not inside the tree
        if (!this.bounds.containsRect(p))
            return false;
        if (this.depth < QuadTree.MAX_DEPTH && (this.topLeft != undefined || this.objects.length >= QuadTree.MAX_NODES)) {
            // Split up if not already split up and add the point to an accepting node
            if (this.topLeft == undefined)
                this.split();
            if (this.topLeft!.insert(p) ||
                this.topRight!.insert(p) ||
                this.bottomLeft!.insert(p) ||
                this.bottomRight!.insert(p)) return true;
        }
        this.objects.push(p);
        return true;
    }
    /// Split this into 4 quartiles.
    private split() {
        // Compute quartile width and height
        const w = this.bounds.width / 2, h = this.bounds.height / 2,
            x = this.bounds.x, y = this.bounds.y;
        // Make a new quad tree for each quartile
        this.topLeft = new QuadTree<P>(new Rectangle(x, y, w, h));
        this.topRight = new QuadTree<P>(new Rectangle(x + w, y, w, h));
        this.bottomLeft = new QuadTree<P>(new Rectangle(x, y - h, w, h));
        this.bottomRight = new QuadTree<P>(new Rectangle(x + w, y - h, w, h));
        // Try inserting objects into a child quadtree.
        for (const o of this.objects) {
            if (this.topLeft.insert(o) ||
                this.topRight.insert(o) ||
                this.bottomRight.insert(o) ||
                this.bottomLeft.insert(o))
                this.objects.splice(this.objects.indexOf(o), 1);
        }
    }
    /// Retrieve all the objects that might be intersecting with `range`
    retrieve(range: BaseRectangle, objects: P[] = []): P[] {
        // No objects intersect when range doesn't intersect bounds
        if (!this.bounds.intersects(range, 0))
            return objects;
        // Add objects that intersect with range to the array
        for (const o of this.objects)
            if (intersects(range.x, range.y, range.width, range.height, o.x, o.y, o.width, o.height, 0))
                objects.push(o);
        // If this is a leaf node
        if (this.topLeft == undefined)
            return objects;
        // Retrieve objects from each quadrant
        this.topLeft!.retrieve(range, objects);
        this.topRight!.retrieve(range, objects);
        this.bottomLeft!.retrieve(range, objects);
        this.topLeft!.retrieve(range, objects);
        return objects;
    }
}