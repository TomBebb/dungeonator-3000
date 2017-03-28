import { BaseRectangle, Rectangle } from './Rectangle';
/// A quad tree, a kind of tree where each node has exactly 4 children, and is used
/// here to split up a grid into 4 quartiles repeatedly.
///
/// Based on https://gamedevelopment.tutsplus.com/tutorials/quick-tip-use-quadtrees-to-detect-likely-collisions-in-2d-space--gamedev-374
/// But ported to TypeScript and given descriptive generic
export default class QuadTree<R extends BaseRectangle> {
    /// The maximum number of objects each node can contain before being split up.
    private static readonly MAX_OBJECTS: number = 10;
    /// The maximum number of levels this tree can store before being split up.
    private static readonly MAX_LEVELS: number = 5;

    /// The number of layers this tree.
    private level: number;
    /// The objects this tree contains.
    private objects: R[] = [];
    /// The rectangle this tree lies in.
    private bounds: Rectangle;
    /// The quad trees this contains.
    ///
    /// Only 4 trees can be stored on a quad tree.
    private nodes: (QuadTree<R> | null)[] = [];
    constructor(bounds: Rectangle, level: number = 0) {
        this.bounds = bounds;
        this.level = level;
    }
    /// Clear the quad tree.
    clear(): void {
        this.objects.splice(0);
        for(let i = 0; i < this.nodes.length; i++)
            if(this.nodes[i] != null) {
                this.nodes[i]!.clear();
                this.nodes[i] = null;
            }
    }
    /// Split into 4 quartiles.
    private split() {
        // Compute quartile width and height
        const subW = this.bounds.width / 2, subH = this.bounds.height / 2;
        const x = this.bounds.x, y = this.bounds.y;
        const l = this.level + 1;
        // Make a new quad tree for each quartile
        this.nodes[0] = new QuadTree<R>(new Rectangle(x + subW, y, subW, subH), l);
        this.nodes[1] = new QuadTree<R>(new Rectangle(x, y, subW, subH), l);
        this.nodes[2] = new QuadTree<R>(new Rectangle(x, y + subH, subW, subH), l);
        this.nodes[3] = new QuadTree<R>(new Rectangle(x + subW, y + subH, subW, subH), l);
    }
    /// Determine which quartile `rect` belongs to
    private indexOf(r: BaseRectangle): number {
        let index = -1;
        const c = this.bounds.centre;
        const vMid = c.x, hMid = c.y;
        const topQuad = r.y < hMid && r.y + r.height < hMid;
        const bottomQuad = r.y > hMid;
        if(r.x < vMid && r.x + r.width < vMid) {
            if(topQuad)
                index = 1;
            else if(bottomQuad)
                index = 2;
        } else if(r.x > vMid) {
            if(topQuad)
                index = 0;
            else if(bottomQuad)
                index = 3;
        }
        return index;
    }
    /// Insert the object `r` into this tree.
    insert(r: R) {
        if(this.nodes[0] != null) {
            const i = this.indexOf(r);
            if(i != -1) {
                this.nodes[i]!.insert(r);
                return;
            }
        }
        this.objects.push(r);
        if(this.objects.length > QuadTree.MAX_OBJECTS && this.level < QuadTree.MAX_LEVELS) {
            if(this.nodes[0] == null)
                this.split();
            let i = 0;
            while(i < this.objects.length) {
                const ind = this.indexOf(this.objects[i]);
                if(ind != -1) {
                    const v = this.objects[i];
                    this.objects.splice(i, 1);
                    this.nodes[ind]!.insert(v);
                } else
                    i++;
            }
        }
    }
    /// Retrieve objects that might be colliding with the given objects.
    retrieve(objects: R[], obj: BaseRectangle) {
        objects.splice(0);
        const i = this.indexOf(obj);
        if(i != -1 && this.nodes[0] != null)
            this.nodes[i]!.retrieve(objects, obj);
        for(const obj of this.objects)
            objects.push(obj);
    }
}