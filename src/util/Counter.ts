/// A counter class, intended to be used for running things every certain number of frames
///
/// Handy for cleaning up code with lots of counters.
export default class Counter {
	// The internal list of callback
	private callbacks: Callback[] = [];
	update(dt: number) {
		// For each registered callback
		for(const c of this.callbacks) {
			// Add the change in time to that callback's counter
			c.sinceLast += dt;
			if(c.sinceLast > c.interval) {
				c.sinceLast -= c.interval;
				// Run the function
				c.callback();
			}
		}
	}
	clear() {
		this.callbacks.splice(0);
	}
	/// Register `cb` to run every `interval` seconds
	register(interval: number, cb: () => void) {
		this.callbacks.push({
			sinceLast: 0,
			interval: interval,
			callback: cb
		})
	}
	unregister(cb: () => void) {
		const i = this.callbacks.findIndex((v) => v.callback == cb);
		this.callbacks.splice(i, 1);
	}
}

/// A registered callback
interface Callback {
	callback: () => void,
	interval: number,
	sinceLast: number,
}