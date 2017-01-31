/// Allows you to associate keys with values.
export default class HashMap<K extends Hash, V> {
    _ = new Map<number, V>();
    clear() {
        this._.clear();
    }
    delete(key: K) {
        this._.delete(key.hash());
    }
    has(key: K): boolean {
        return this._.has(key.hash());
    }
    get(key: K): V | undefined {
        return this._.get(key.hash());
    }
    set(key: K, value: V) {
        this._.set(key.hash(), value);
    }
}

interface Hash {
    hash(): number;
}