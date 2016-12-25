interface Comparable {
	compareTo(other: any): number;
}
/*
/// A binary heap
export default class Heap<T extends Comparable> {
	private size: number;
	private heap: T[];
	constructor(array: T[] = []) {
		this.heap = new Array<T>(array.length);
		Heap.arraycopy(array, 0, this.heap, 1, array.length);
		this.size = array.length;
		this.buildHeap();
	}
	private buildHeap() {
		for(let k = this.size / 2; k > 0; k--)
			this.percolatingDown(k);
	}
	private static arraycopy<A>(src: A[], srcPos: number, dest: a[], destPos: number, length: number) {
		for(let i = 0; i < length; i++)
			dest[destPos + i] = src[srcPos + i];
	}
   	private doubleSize(): void {
	    const old = this.heap;
	    this.heap = new Array<T>(this.heap.length * 2);
	    Heap.arraycopy(old, 1, this.heap, 1, this.size);
   	}
   	private percolatingDown(k: number): void {
   		const tmp = this.heap[k];
   		let child: number;
   		for(; 2 * k <= this.size; k = child) {
   			child = 2 * k;
   			if(child !== this.size && this.heap[child].compareTo(this.heap[child + 1]) > 0)
   					child++;
   			if(tmp.compareTo(this.heap[child]) > 0)
   				this.heap[k] = this.heap[child];
   			else break;
   		}
   		this.heap[k] = tmp;
   	}
	heapSort(array: T[]) {
		this.size = array.length;
		this.heap = new Array<T>(array.length + 1);
		Heap.arraycopy(array, 0, this.heap, 1, this.size);
		for(let i = this.size; i > 0; i--) {
			const tmp = this.heap[i];
			this.heap[i] = this.heap[1];
			this.heap[1] = tmp;
			this.size--;
			this.percolatingDown(1);
		}
		for(let k = 0; k < this.heap.length - 1; k++)
			array[k] = this.heap[this.heap.length - 1 - k];
	}
	deleteMin(): T | undefined {
		if(this.size === 0)
			return undefined;
		const min = this.heap[1];
		this.heap[1] = this.heap[this.size--];
		this.percolatingDown(1);
		return min;
	}
	insert(v: T) {
		if(this.size === this.heap.length - 1)
			this.doubleSize();
		let pos = ++this.size;
		for(; pos > 1 && v.compareTo(this.heap[pos / 2]) < 0; pos = pos / 2)
			this.heap[pos] = this.heap[pos / 2];
	}
	entries(): Iterator<T> {
		let index = 0;
		return {
			next: () => {
				return { done: index >= this.size, value: this.heap[index++]};
			}
		}
	}
}*/