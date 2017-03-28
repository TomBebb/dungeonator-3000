/// An implementation of a priorty queue based on a binary heap that sorts from lowest to highest.
/// AKA An array min-heap
/// Based on https://github.com/bgrins/javascript-astar/blob/master/astar.js, with a few changes
/// like using a score function and being strongly typed.

export default class Heap<T> {
    /// The array in which the data is stored
    readonly content: T[] = [];
    /// The score function, used to get a numerical score from an element.
    readonly score: (_:T) => number; 
    get size() {
        return this.content.length;
    }
    constructor(score: (_:T) => number) {
        this.score = score;
    }
    /// Clear the heap of elements.
    clear() {
        this.content.splice(0);
    }

    /// Add an element to the heap
    push(elem: T) {
        // Add it to the array.
        this.content.push(elem);
        // Position it in the right place.
        this.sinkDown(this.content.length - 1);
    }

    /// Remove the element with the lowest score from the heap
    pop(): T | undefined {
        // Return undefined when this has no elements.
        if(this.content.length == 0)
            return undefined;
        // Store the element 
        const result = this.content[0];
        const end = this.content.pop()!;
        if(this.content.length > 0) {
            this.content[0] = end;
            this.bubbleUp(0);
        }
        return result;
    }
    /// Update the element `elem`'s position in the tree.
    ///
    /// This should be called when the value its score function returns has
    /// canged.
    rescoreElement(elem: T) {
        const i = this.content.findIndex((e) => e == elem);
        this.sinkDown(i);
    }
    /// Sink the element at index `n` through the array.
    private sinkDown(n: number) {
        const elem: T = this.content[n];
        // While the element can still sink..
        while(n > 0) {
            // Compute the parent index.
            const parentN = ((n + 1) >> 1) - 1;
            const parent = this.content[parentN];

            if(this.score(elem) < this.score(parent)) {
                this.content[parentN] = elem;
                this.content[n] = parent;
                n = parentN;
            } else {
                break;
            }
        }
    }
    /// Push the element at index `n` up the tree.
    private bubbleUp(n: number) {
        const length = this.content.length;
        const elem: T = this.content[n];
        const score: (_: T) => number = this.score;
        const elemScore = score(elem);
        while(true) {
            const child2N = (n + 1) << 1;
            const child1N = child2N - 1;
            let swap: number = -1;
            let child1Score: number | undefined = undefined;
            if(child1N < length) {
                const child = this.content[child1N];
                child1Score = score(child);
                if(child1Score < elemScore)
                    swap = child1N;
            }
            if(child2N < length) {
                const child = this.content[child2N];
                const score2Score = score(child);
                if(score2Score < (swap == -1 ? elemScore : child1Score!))
                    swap = child2N;
            }
            if(swap != -1) {
                this.content[n] = this.content[swap];
                this.content[swap] = elem;
                n = swap;
            } else {
                break;
            }
        }
    }
}