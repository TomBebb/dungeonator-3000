/// A pool of versions of objects
export default class Pool<T extends Reset> {
	private readonly values: T[] = new Array(8);
	private readonly template: T;

	constructor(template: T) {
		this.template = template;
	}

	/// Make a new instance of T
	create(): T {
		const v: T | undefined = this.values.pop();
		if(v !== undefined)
			return v!;
		else {
			const v: T = Object.assign({}, this.template);
			Object.setPrototypeOf(v, Object.getPrototypeOf(this.template));
			return v;
		}
	}

	/// Recycle the value
	recycle(v: T) {
		v.reset();
		this.values.push(v);
	}
}

interface Reset {
	reset(): void;
}