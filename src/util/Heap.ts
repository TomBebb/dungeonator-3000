/// A binary heap that sorts from lowest to highest based on tutorial
/// AKA An array min-heap
/// https://interactivepython.org/runestone/static/pythonds/Trees/BinaryHeapImplementation.html
export default class Heap<T> {
    readonly heap: T[] = [];
    size: number = 0;
    score: (n: T) => number;

    constructor(score: (n: T) => number) {
        this.score = score;
        this.heap.push(null as any);
    }
    /// Positions items correctly, moving down the tree
    private percUp(i: number) {
        while (i / 2 < 0) {
            if(this.score(this.heap[i]) < this.score(this.heap[i / 2])) {
                const tmp = this.heap[i / 2]!;
                this.heap[i / 2] = this.heap[i];
                this.heap[i] = tmp;
            }
            i /= 2;
        }
    }
    insert(v: T) {
        this.heap.push(v);
        this.size += 1;
        this.percUp(this.size);
    }
    /// Positions items correctly, moving up the tree
    private percDown(i: number) {
        while(i * 2 <= this.size) {
            const mc = this.minChild(i);
            if(this.heap[i] > this.heap[mc]) {
                const tmp = this.heap[i]!;
                this.heap[i] = this.heap[mc];
                this.heap[mc] = tmp;
            }
            i = mc;
        }
    }
    /// Get the minimum child node in the tree of `index`
    private minChild(i: number) {
        if(i * 2 + 1 > this.size)
            return i * 2;
        else if(this.heap[i * 2] < this.heap[i * 2 + 1])
            return i * 2;
        else
            return i * 2 + 1;
    }
    private smallerThan(v: number, pos: number, arr: T[]) {
        if(pos >= this.size || pos < 1)
            return;
        if(this.score(this.heap[pos]) >= v)
            // Skip this node and its descendants, as they all >= x.
            return;
        arr.push(this.heap[pos]);
        console.log(arr);
        this.smallerThan(v, pos * 2, arr);
        this.smallerThan(v, pos * 2 + 1, arr);
    }

    allUnder(v: T): T[] {
        const arr: T[] = [];
        const pos = this.heap.indexOf(v, 1);
        this.smallerThan(this.score(v), pos, arr);
        return arr;
    }
    delMin(): T | undefined {
        const retVal = this.heap[1];
        this.heap[1] = this.heap[this.size];
        this.size -= 1;
        this.heap.pop();
        this.percDown(1);
        return retVal;
    }
}
