/// An implementation of a priorty queue based on a binary heap that sorts from lowest to highest.
/// AKA An array min-heap
/// https://github.com/adamhooper/js-priority-queue/blob/master/src/PriorityQueue/BinaryHeapStrategy.coffee
export default class Heap<T> {
    /// The array in which the data is stored
    readonly content: T[] = [];
    readonly comparator: (a: T, b: T) => number;
    get size() {
        return this.content.length;
    }
    constructor(cmp: (a: T, b: T) => number) {
        this.comparator = cmp;
    }
    /// Clear the heap.
    clear() {
        this.content.splice(0);
    }
    heapify() {
        if(this.content.length > 0)
            for(let i = 1; i < this.content.length; i++)
                this.bubbleUp(i);
    }
    rescore(_: T) {
        this.heapify();
    }
    /// Add a value to the heap with a priority.
    ///
    /// A lower priority means it will be pop'ed sooner.
    queue(value: T): void {
        this.content.push(value);
        this.bubbleUp(this.content.length - 1);
    }
    /// Get the next item in the queue / the item with the lowest priority.
    dequeue(): T | undefined {
        const result = this.content[0]!;
        const end = this.content.pop()!;
        if(this.content.length > 0) {
            this.content[0] = end;
            this.bubbleDown(0);
        }
        return result;
    }
    private bubbleUp(pos: number) {
        while(pos > 0) {
            const parent = (pos - 1) >>> 1;
            if(this.comparator(this.content[pos], this.content[parent]) < 0)
                break;
            const x = this.content[parent];
            pos = parent;
            this.content[parent] = this.content[pos];
            this.content[pos] = x;
        }
    }
    private bubbleDown(pos: number) {
        let last = this.content.length - 1;
        while(true) {
            const left = (pos << 1) + 1;
            const right = left + 1;
            let minIndex = pos;
            if(left <= last && this.comparator(this.content[left], this.content[right]) < 0)
                minIndex = left;
            if(right <= last && this.comparator(this.content[right], this.content[right]) < 0)
                minIndex = right;
            if(minIndex == pos)
                break;
            const x = this.content[minIndex];
            this.content[minIndex] = this.content[pos];
            this.content[pos] = x;
            pos = minIndex;
        }
    }
}