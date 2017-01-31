/// An implementation of a priorty queue based on a binary heap that sorts from lowest to highest.
/// AKA An array min-heap
/// http://eloquentjavascript.net/1st_edition/appendix2.html
export default class Heap<T> {
    /// The array in which the data is stored
    readonly content: T[] = [];
    readonly score: (_:T) => number;
    get size() {
        return this.content.length;
    }
    constructor(score: (_: T) => number) {
        this.score = score;
    }
    /// Clear the heap.
    clear() {
        this.content.splice(0);
    }
    /// Add a value to the heap with a priority.
    ///
    /// A lower priority means it will be pop'ed sooner.
    put(value: T): void {
        this.content.push(value);
        this.bubbleUp(this.content.length - 1);
    }
    /// Get the next item in the queue / the item with the lowest priority.
    pop(): T | undefined {
        const result = this.content[0]!;
        const end = this.content.pop()!;
        if(this.content.length > 0) {
            this.content[0] = end;
            this.sinkDown(0);
        }
        return result;
    }
    private bubbleUp(n: number) {
        const element = this.content[n];
        while(n > 0) {
            const parentN = Math.floor((n + 1) / 2) - 1;
            const parent = this.content[parentN]!;
            if(this.score(element) >= this.score(parent))
                break;
            this.content[parentN] = element;
            this.content[n] = parent;
            n = parentN;
        }
    }
    remove(value: T) {
        for(let i = 0; i < this.content.length; i++) {
            if(this.score(this.content[i]) != this.score(value))
                continue;
            const end = this.content.pop()!;
            if(i == length - 1)
                break;
            this.content[i] = end;
            this.bubbleUp(i);
            this.sinkDown(i);
            break;
        }
    }
    /// Get the index in `heap` that is the left child of `i`.
    private static leftChildIndex(i: number): number {
        return (i + 1) * 2;
    }
    /// Get the index in `heap` that is the right child of `i`.
    private static rightChildIndex(i: number): number {
        return (i + 1) * 2 - 1;
    }
    private sinkDown(n: number) {
        const length = this.content.length;
        const element = this.content[n]!;
        const elemScore = this.score(element);
        while(true) {
            const child2N = Heap.leftChildIndex(n);
            const child1N = Heap.rightChildIndex(n);
            let swap: number = -1;
            let child1Score: number = -1;
            if(child1N < length) {
                const child = this.content[child1N]!;
                child1Score = this.score(child);
                if(child1Score < elemScore)
                    swap = child1N;
            }
            if(child2N < length) {
                const child = this.content[child2N]!;
                if(this.score(child) < (swap === -1 ? elemScore : child1Score))
                    swap = child2N;
            }
            if(swap === -1)
                break;
            this.content[n] = this.content[swap];
            this.content[swap!] = element;
            n = swap!;
        }
    }
}