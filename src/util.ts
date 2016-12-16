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
export interface AssetsPreload {
	images: Array<string>
}
export class Assets {
	images: Map<string, HTMLImageElement> = new Map();
	getImage(path: string): HTMLImageElement {
		if(this.images.has(path))
			return this.images.get(path)!;
		else
			throw `Failed to load ${path}`;
	}
	/// Asynchronous image loading
	loadImage(path: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			if(this.images.has(path))
				resolve(this.images.get(path)!);
			// make the image
			let loaded = false;
			const i = document.createElement("img");
			i.src = `assets/${path}`;
			// add it to the assets
			this.images.set(path, i);
			i.onload = (_: Event) => {
				loaded = true;
				resolve(i);
			};
			i.onerror = (_: Event) => {
				reject(`Failed to load ${i.src}`);
			}
		})
	}
	static load(assets: AssetsPreload): Promise<Assets> {
		return new Promise((resolve, _) => {
			const loadedAssets = new Assets();
			let loaded = 0;
			const numAssets = assets.images.length;
			for(const path of assets.images)
				loadedAssets.loadImage(path).then((_) => {
					loaded += 1;
					if(loaded >= numAssets)
						resolve(loadedAssets);
				});
			if(numAssets <= 0)
				resolve(loadedAssets);
		});
	}
}