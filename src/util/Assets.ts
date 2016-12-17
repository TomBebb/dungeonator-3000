
export interface AssetsPreload {
	images: Array<string>
}
export default class Assets {
	images: Map<string, HTMLImageElement> = new Map();
	private loaded: number = 0;
	private total: number = 0;
	get progress(): number {
		return this.total === 0 ? 1 : this.loaded / this.total;
	}
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
			this.total++;
			i.onload = (_: Event) => {
				loaded = true;
				this.loaded++;
				resolve(i);
			};
			i.onerror = (_: Event) => {
				reject(`Failed to load ${i.src}`);
			}
		})
	}
	load(assets: AssetsPreload): Promise<Assets> {
		return new Promise((resolve, _) => {
			for(const path of assets.images)
				this.loadImage(path).then((_) => {
					if(this.loaded >= this.total)
						resolve(this);
				});
			if(this.total <= 0)
				resolve(this);
		});
	}
}