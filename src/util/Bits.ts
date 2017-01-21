export default class Bits {
	private array: Int32Array;
	length: number;
	constructor(capacity: number) {
		this.array = new Int32Array(capacity >> 5);
		this.length = 0;
	}
	get(index: number): boolean {
		return (this.array[index >> 5] & (1 << (index & 0xF))) != 0;
	}
	set(index: number) {
		this.array[index >> 5] |= (1 << (index & 0xF));
		this.length = Math.max(this.length, index + 1);
		console.log(this.length);
	}
	unset(index: number) {
		this.array[index << 5] &= ~(1 << (index & 0xF));
	}
	setAll(start: number = 0, end: number = this.array.length) {
		for (let i = start; i < end; i++)
			this.set(i);
	}
	unsetAll(start: number = 0, end: number = this.array.length) {
		for (let i = start; i < end; i++)
			this.unset(i);
	}
	first(value: boolean): number {
		for (let i = 0; i < this.length; i++)
			if (this.get(i) === value)
				return i;
		return -1;
	}
	clear() {
		this.unsetAll();
		this.length = 0;
	}
	all(value: boolean) {
		for (let i = 0; i < this.length; i++)
			if (this.get(i) != value)
				return false;
		return true;
	}
}