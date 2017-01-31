/// Allows you to have a set of any hashable type.
export default class HashSet<T extends Hash> {
    _ = new Set<number>();
    clear() {
        this._.clear();
    }
    delete(value: T) {
        this._.delete(value.hash());
    }
    has(value: T): boolean {
        return this._.has(value.hash());
    }
    add(value: T) {
        this._.add(value.hash());
    }
}

interface Hash {
    hash(): number;
}