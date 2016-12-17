
export interface AssetsPreload {
	images: Array<string>,
	audio: Array<string>
}
export default class Assets {
	images: Map<string, HTMLImageElement> = new Map();
	audio: Map<string, HTMLAudioElement> = new Map();
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
	/// Asynchronous image loading
	loadAudio(path: string): Promise<HTMLAudioElement> {
		return new Promise((resolve, reject) => {
			if(this.audio.has(path))
				resolve(this.audio.get(path)!);
			// make the audio
			let loaded = false;
			const a = new Audio(`assets/${path}`);
			// add it to the assets
			this.audio.set(path, a);
			this.total++;
			a.onload = (_: Event) => {
				loaded = true;
				this.loaded++;
				resolve(a);
			};
			a.onerror = (e: ErrorEvent) => {
				reject(`Failed to load ${a.src} ${e.error}`);
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
			for(const path of assets.audio)
				this.loadAudio(path).then((_) => {
					if(this.loaded >= this.total)
						resolve(this);
				});
			if(this.total <= 0)
				resolve(this);
		});
	}
}