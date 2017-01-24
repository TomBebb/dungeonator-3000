/// A binary heap that sorts from lowest to highest based on tutorial
/// AKA An array min-heap
/// http://eloquentjavascript.net/1st_edition/appendix2.html
export default class Heap<T> {
    readonly content: Item<T>[] = [];
    get size() {
        return this.content.length;
    }
    clear() {
        this.content.splice(0);
    }
    put(value: T, priority: number): void {
        this.content.push({
            value: value,
            priority: priority
        });
        this.bubbleUp(this.content.length - 1);
    }
    pop(): T | undefined {
        const result = this.content[0]!;
        const end = this.content.pop()!;
        if(this.content.length > 0) {
            this.content[0] = end;
            this.sinkDown(0);
        }
        return result.value;
    }
    private bubbleUp(n: number) {
        const element = this.content[n];
        while(n > 0) {
            const parentN = Math.floor((n + 1) / 2) - 1;
            const parent = this.content[parentN]!;
            if(element.priority >= parent.priority)
                break;
            this.content[parentN] = element;
            this.content[n] = parent;
            n = parentN;
        }
    }
    private static leftChildIndex(i: number): number {
        return (i + 1) * 2;
    }
    private static rightChildIndex(i: number): number {
        return (i + 1) * 2 - 1;
    }
    private sinkDown(n: number) {
        const length = this.content.length;
        const element = this.content[n]!;
        const elemScore = element.priority;
        while(true) {
            const child2N = Heap.leftChildIndex(n);
            const child1N = Heap.rightChildIndex(n);
            let swap: number = -1;
            let child1Score: number = -1;
            if(child1N < length) {
                const child = this.content[child1N]!;
                child1Score = child.priority;
                if(child.priority < elemScore)
                    swap = child1N;
            }
            if(child2N < length) {
                const child = this.content[child2N]!;
                if(child.priority < (swap === -1 ? elemScore : child1Score))
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

interface Item<T> {
    value: T;
    priority: number;
}
