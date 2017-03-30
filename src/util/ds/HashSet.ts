import Hash from './Hash';

/// Allows you to have a set, with the value having a custom hash implementation.
///
/// The key distinction between an array and a set is that a set only permits one
/// of each value.
export default class HashSet<T extends Hash> {
    /// The internal set of hashed values.
    _ = new Set<number>();
    /// Clear this set of values.
    clear() {
        this._.clear();
    }
    /// Delete the value `value` from this set.
    delete(value: T) {
        this._.delete(value.hash());
    }
    /// Return true when this set contains `value`.
    has(value: T): boolean {
        return this._.has(value.hash());
    }
    /// Add this `value` to this set.
    ///
    /// If there is already a value with the same hash, it will be overwritten.
    add(value: T) {
        this._.add(value.hash());
    }
}