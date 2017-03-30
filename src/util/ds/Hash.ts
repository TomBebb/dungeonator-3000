/// Implemented by hashable objects.
export interface Hash {
    /// Return a 32-bit integer hash of this value.
    hash(): number;
}

export default Hash;