/// A counter class, intended to be used for running things every certain number of frames
///
/// Handy for cleaning up code with lots of counters.
export default class Counter {
    // The internal list of callback
    private callbacks: Callback[] = [];
    /// Update the callbacks array with delta time `dt`.
    update(dt: number) {
        // For each registered callback
        for (const c of this.callbacks) {
            // Add the change in time to that callback's counter
            c.sinceLast += dt;
            if (c.sinceLast > c.interval) {
                c.sinceLast -= c.interval;
                // Run the function
                c.callback();
            }
        }
    }
    /// Clear this counter of all callbacks.
    clear() {
        this.callbacks.splice(0);
    }
    /// Register `cb` to run every `interval` seconds
    register(interval: number, cb: () => void) {
        // Add the callback and details about it to `callbacks`
        this.callbacks.push({
            sinceLast: 0,
            interval: interval,
            callback: cb
        })
    }
    /// Unregister the callback `cb`
    unregister(cb: () => void) {
        // Find the index it has in `callbacks`
        const i = this.callbacks.findIndex((v) => v.callback == cb);
        // If the callback is in `callbacks`
        if (i != -1)
            // Remove it
            this.callbacks.splice(i, 1);
    }
}

/// A registered callback
interface Callback {
    /// The function to call.
    callback: () => void,
    /// How often to run it, in seconds.
    interval: number,
    /// The number of seconds since this was last ran.
    sinceLast: number,
}