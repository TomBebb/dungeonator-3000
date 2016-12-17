export function lowest<T>(iter: Iterator<T>, cb: (v: T) => number): T | null {
	let value: T | null = null;
	let valueCost = Infinity;
	let next: IteratorResult<T> | null;
	while((next = iter.next()) != null) {
		if(next != null && cb(next.value) < valueCost) {
			value = next.value;
			valueCost = cb(next.value);
			if(next.done)
				break;
		}
	}
	return value;
}