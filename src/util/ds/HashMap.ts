import Hash from './Hash';

/// Allows you to associate keys with values, with the keys having a custom hash implementation.
export default class HashMap<K extends Hash, V> {
    /// The internal map, from hashed keys to values.
    private _ = new Map<number, V>();
    /// The default value to give values.
    private readonly _default: V | undefined;
    constructor(_default: V | undefined = undefined) {
        this._default = _default;
    }
    /// Clear this map of values.
    clear() {
        this._.clear();
    }
    /// Unassociate the key `key` with whatever value it has.
    delete(key: K) {
        this._.delete(key.hash());
    }
    /// Return true when this map has a value associated with `key`.
    has(key: K): boolean {
        return this._.has(key.hash());
    }
    /// Returns the value associated with `key`.
    get(key: K): V | undefined {
        if (!this.has(key))
            return this._default;
        return this._.get(key.hash());
    }
    /// Associate the key `key` with `value`
    set(key: K, value: V) {
        this._.set(key.hash(), value);
    }
}