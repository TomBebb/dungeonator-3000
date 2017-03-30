import { BaseRectangle, Rectangle } from './Rectangle';
import {intersects} from '../math';
/// A quad tree, a kind of tree where each node has exactly 4 children, and is used
/// here to split up a grid into 4 quartiles repeatedly.
///
/// Based on http://algs4.cs.princeton.edu/92search/QuadTree.java.html
/// But ported to TypeScript and given descriptive generic
export default class QuadTree<P extends BaseRectangle> {
    private static readonly NODE_CAPACITY: number = 4;
    private static readonly MAX_DEPTH: number = 4;
    readonly bounds: Rectangle;
    private depth:number;
    private topLeft: QuadTree<P> | undefined;
    private topRight: QuadTree<P> | undefined;
    private bottomLeft: QuadTree<P> | undefined;
    private bottomRight: QuadTree<P> | undefined;
    private objs: P[] = [];
    constructor(bounds: Rectangle, depth: number = 0) {
        this.bounds = bounds;
        this.depth = depth;
    }
    clear(): void {
        // Delete reference quad trees
        this.topLeft = undefined;
        this.topRight = undefined;
        this.bottomLeft = undefined;
        this.bottomRight = undefined;
        // Clear objects
        this.objs.splice(0);
        this.depth = 0;
    }
    /// Insert an object
    insert(p: P): boolean {
        // Ignore objects not inside the tree
        if(!this.bounds.containsRect(p))
            return false;
        if(this.depth < QuadTree.MAX_DEPTH && (this.topLeft != undefined || this.objs.length >= QuadTree.NODE_CAPACITY)) {
            // Split up and add the point to an accepting node
            if(this.topLeft == undefined)
                this.split();
            if(this.topLeft!.insert(p) ||
                this.topRight!.insert(p) ||
                this.bottomLeft!.insert(p) ||
                this.bottomRight!.insert(p)) return true;
        }
        this.objs.push(p);
        return true;
    }
    /// Split into 4 quartiles.
    private split() {
        // Compute quartile width and height
        const halfW = this.bounds.width / 2, halfH = this.bounds.height / 2,
        x = this.bounds.x, y = this.bounds.y;
        // Make a new quad tree for each quartile
        this.topLeft = new QuadTree<P>(new Rectangle(x, y, halfW, halfH));
        this.topRight = new QuadTree<P>(new Rectangle(x + halfW, y, halfW, halfH));
        this.bottomLeft = new QuadTree<P>(new Rectangle(x, y - halfH, halfW, halfH));
        this.bottomRight = new QuadTree<P>(new Rectangle(x + halfW, y - halfH, halfW, halfH));
        for(const o of this.objs) {
            if(this.topLeft.insert(o) ||
            this.topRight.insert(o) ||
            this.bottomRight.insert(o) ||
            this.bottomLeft.insert(o))
                this.objs.splice(this.objs.indexOf(o), 1);
        }
    }
    retrieve(range: BaseRectangle, objects: P[] = []): P[] {
        if(!this.bounds.intersects(range, 0))
            return objects;
        for(const o of this.objs)
            if(intersects(range.x, range.y, range.width, range.height, o.x, o.y, o.width, o.height, 0))
                objects.push(o);
        // If this is a leaf node
        if(this.topLeft == undefined)
            return objects;
        this.topLeft!.retrieve(range, objects);
        this.topRight!.retrieve(range, objects);
        this.bottomLeft!.retrieve(range, objects);
        this.topLeft!.retrieve(range, objects);
        return objects;
    }
}