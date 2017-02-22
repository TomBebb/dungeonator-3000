/// An implementation of a priorty queue based on a binary heap that sorts from lowest to highest.
/// AKA An array min-heap
/// Based on https://github.com/bgrins/javascript-astar/blob/master/astar.js

interface Wrapper<T> {
    v: T;
    score: number;
}

export default class Heap<T> {
    /// The array in which the data is stored
    readonly content: Wrapper<T>[] = [];
    get size() {
        return this.content.length;
    }
    clear() {
        this.content.splice(0);
    }
    /// Add an element to the heap
    push(elem: T, score: number) {
        // Add it to the array.
        this.content.push({v: elem, score: score});
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
        return result.v;
    }
    /// Update an element's position in the tree.
    rescoreElement(elem: T) {
        this.sinkDown(this.content.findIndex((e) => e.v == elem));
    }
    sinkDown(n: number) {
        const elem: Wrapper<T> = this.content[n];
        // While the element can still sink..
        while(n > 0) {
            // Compute the parent index.
            const parentN = ((n + 1) >> 1) - 1;
            const parent = this.content[parentN];

            if(elem.score < parent.score) {
                this.content[parentN] = elem;
                this.content[n] = parent;
                n = parentN;
            } else {
                break;
            }
        }
    }
    /// Push an element up the tree
    bubbleUp(n: number) {
        const length = this.content.length;
        const elem: Wrapper<T> = this.content[n]!;
        const elemScore = elem.score;
        while(true) {
            const child2N = (n + 1) << 1;
            const child1N = child2N - 1;
            let swap: number = -1;
            let child1Score: number | undefined = undefined;
            if(child1N < length) {
                const child = this.content[child1N];
                child1Score = child.score;
                if(child1Score < elemScore)
                    swap = child1N;
            }
            if(child2N < length) {
                const child = this.content[child2N];
                const score = child.score;
                if(score < (swap == -1 ? elemScore : child1Score))
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