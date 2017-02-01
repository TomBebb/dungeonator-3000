/// A fixed-length bit set
export default class Bits {
	private array: Int32Array;
	/// How many bits have been set
	length: number;
	/// Make a new bit set with the bit capacity given.
	constructor(capacity: number) {
		this.array = new Int32Array(capacity >> 5);
		this.length = 0;
	}
	/// Get the `index`th bit as a boolean
	get(index: number): boolean {
		return (this.array[index >> 5] & (1 << (index & 0xF))) != 0;
	}
	/// Set the `index`th bit to true / 1
	set(index: number) {
		this.array[index >> 5] |= (1 << (index & 0xF));
		this.length = Math.max(this.length, index + 1);
	}
	/// Set the `index`th bit to false / 0
	unset(index: number) {
		this.array[index << 5] &= ~(1 << (index & 0xF));
	}
	/// Set all the bits between `start` and `end`
	setAll(start: number = 0, end: number = this.length) {
		for (let i = start; i < end; i++)
			this.set(i);
	}
	/// Clear all the bits between `start` and `end`
	unsetAll(start: number = 0, end: number = this.length) {
		for (let i = start; i < end; i++)
			this.unset(i);
	}
	/// Find the first bit set to `value`
	first(value: boolean): number {
		for (let i = 0; i < this.length; i++)
			if (this.get(i) === value)
				return i;
		return -1;
	}
	/// Clear the bit set so no bits are set afterwards
	clear() {
		this.unsetAll();
		this.length = 0;
	}
	/// Returns true when all the bits in the set are set to `value`.
	all(value: boolean) {
		for (let i = 0; i < this.length; i++)
			if (this.get(i) !== value)
				return false;
		return true;
	}
	toString(): string {
		let text = "";
		for (let i =0 ; i < this.length; i++)
			text += this.get(i) ? "1": "0";
		return text;
	}
}