/// Allows you to associate keys with values.
export default class HashMap<K extends Hash, V> {
    _ = new Map<number, V>();
    readonly keys: K[] = [];
    readonly _default: V | undefined;
    constructor(_default: V | undefined = undefined) {
        this._default = _default;
    }
    clear() {
        this._.clear();
        this.keys.splice(0);
    }
    delete(key: K) {
        this._.delete(key.hash());
        this.keys.splice(this.keys.indexOf(key), 1);
    }
    has(key: K): boolean {
        return this._.has(key.hash());
    }
    get(key: K): V | undefined {
        if(!this.has(key))
            return this._default;
        return this._.get(key.hash());
    }
    set(key: K, value: V) {
        this._.set(key.hash(), value);
    }
}

interface Hash {
    hash(): number;
}