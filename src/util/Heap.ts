/// A binary heap that sorts from lowest to highest based on tutorial
/// AKA An array min-heap
/// http://eloquentjavascript.net/1st_edition/appendix2.html
export default class Heap<T> {
    readonly content: T[] = [];
    score: (v: T) => number;

    constructor(score: (v: T) => number) {
        this.score = score;
    }
    get size() {
        return this.content.length;
    }
    clear() {
        this.content.splice(0);
    }
    push(element: T): void {
        this.content.push(element);
        this.bubbleUp(this.content.length - 1);
    }
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
        const score = this.score(element);
        while(n > 0) {
            const parentN = Math.floor((n + 1) / 2) - 1;
            const parent = this.content[parentN]!;
            if(score >= this.score(parent))
                break;
            this.content[parentN] = element;
            this.content[n] = parent;
            n = parentN;
        }
    }
    /*
    private leftChild(i: number): T | undefined {
        return this.content[Heap.leftChildIndex(i)];
    }
    private rightChild(i: number): T | undefined {
        return this.content[Heap.rightChildIndex(i)];
    }*/
    private nextChild(i: number): number {
        const leftIndex = Heap.leftChildIndex(i);
        const rightIndex = Heap.rightChildIndex(i);
        const left = this.content[leftIndex];
        const right = this.content[rightIndex];
        if(left === undefined && right == undefined)
            return -1;
        if(left === undefined || right < left)
            return rightIndex;
        else if(right === undefined || left < right)
            return leftIndex;
        else return -1;
    }
    private static leftChildIndex(i: number): number {
        return (i + 1) * 2;
    }
    private static rightChildIndex(i: number): number {
        return (i + 1) * 2 - 1;
    }
    forEach(): Iterator<T> {
        let i = 0;
        return {
            next: (_) => {
                const oi = i;
                i = this.nextChild(i);
                return {
                    value: this.content[oi],
                    done: oi === -1
                };
            }
        };
    }
    allUnder(score: number): Iterator<T> {
        let i = 0;
        return {
            next: (_) => {
                const oi = i;
                i = this.nextChild(i);
                return {
                    value: this.content[oi],
                    done: oi === -1 || this.score(this.content[oi]) > score
                };
            }
        };
    }
    private sinkDown(n: number) {
        const length = this.content.length;
        const element = this.content[n];
        const elemScore = this.score(element!);
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
                const score = this.score(child);
                if(score < (swap === -1 ? elemScore : child1Score))
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
