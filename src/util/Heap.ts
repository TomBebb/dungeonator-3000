/// A binary heap that sorts from lowest to highest
export default class Heap<T> {
    readonly content: T[];
    scoreFunction: (n: T) => number;

    constructor(scoreFunction: (n: T) => number) {
        this.content = [];
        this.scoreFunction = scoreFunction;
    }

    push(n: T): void {
        // Add the new node to the end of the array.
        this.content.push(n);
        // Allow it to sink down.
        this.sinkDown(this.content.length - 1);
    }

    pop(): T | undefined {
        // Store the first node so we can return it later.
        const result = this.content[0];
        // Get the node at the end of the array.
        const end = this.content.pop();
        // If there are any elements left, put the end node at the
        // start, and let it bubble up.
        if (this.content.length > 0) {
            this.content[0] = end!;
            this.bubbleUp(0);
        }
        return result;
    }

    allSatisfying(v: T, compare: (a:number, b:number) => boolean): T[] {
        const score = this.scoreFunction(v);
        const i = this.content.findIndex((v: T) => compare(score, this.scoreFunction(v)));
        if(i < 0)
            return [];
        else
            return this.content.slice(0, i);
    }
    allUnder(v: T): T[] {
        return this.allSatisfying(v, (a, b) => a <= b);
    }

    remove(n: T): void {
        const i = this.content.indexOf(n);

        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        const end = this.content.pop()!;
        if (i !== this.content.length - 1) {
            this.content[i] = end;
            if (this.scoreFunction(end) < this.scoreFunction(n))
                this.sinkDown(i);
            else
                this.bubbleUp(i);
        }
    }

    get size(): number {
        return this.content.length;
    }

    private rescoreElement(n: T) {
        this.sinkDown(this.content.indexOf(n));
    }

    private sinkDown(n: number) {
        // Fetch the element that has to be sunk.
        const element = this.content[n];
        // When at 0, an element can not sink any further.
        while (n > 0) {
            // Compute the parent element's index, and fetch it.
            const parentN = ((n + 1) >> 1) - 1,
            parent = this.content[parentN];
            // Swap the elements if the parent is greater.
            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                // Update 'n' to continue at the new position.
                n = parentN;
            }
            // Found a parent that is less, no need to sink any further.
            else
                break;
        }
    }

    private bubbleUp(n: number) {
        // Look up the target element and its score.
        const length = this.content.length,
            element = this.content[n],
            elemScore = this.scoreFunction(element);

        while (true) {
            // Compute the indices of the child elements.
            const child2N = (n + 1) << 1;
            const child1N = child2N - 1;
            // This is used to store the new position of the element, if any.
            let swap = null;
            let child1Score;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                const child1 = this.content[child1N];
                child1Score = this.scoreFunction(child1);

                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore)
                    swap = child1N;
            }
            if(child2N < length) {
                const child2 = this.content[child2N];
                const child2Score = this.scoreFunction(child2);
                if(child2Score < (swap === null ? elemScore : child1Score))
                    swap = child2N;
            }
            if(swap !== null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            } else break;
        }
    }
}
