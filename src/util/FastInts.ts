/// A specialist array of ints that rarely get changed.

export default class FastInts {
    /// The internal (typed) array, which is usually faster than an actual array of ints because the JS engine doesn't have to guess.
    private array: Int32Array;
    /// How many elements are valid (outside of this context) in the array, starting from 0.
    length: number;

    constuctor(capacity: number = 8) = {
        this.array = new Int32Array(capacity);
        this.length = 0;
    }

    /// Get the number with offset `index` in `array`.
    get(index: number): number {
        return this.array[index];
    }
    /// Double the capacity of the array.
    private extend() {
        const old = this.array;
        this.array = new Int32Array(old.length * 2);
        // Copy the contents of `old` to `array`.
        for(let i = 0; i < this.length; i++)
            this.array[i] = old[i];
    }
    /// Set `index` in `array` to `value` without any checking whatsoever.
    fastSet(index: number, value:number) {
        this.array[index] = value;
    }
    set(index: number, value: number) {
        // Keep doubling the array's capacity until it can fit.
        while(index >= this.length)
            this.extend();
        // Set the index
        this.array[index] = value;
    }
}