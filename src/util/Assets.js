define(["require", "exports"], function (require, exports) {
    "use strict";
    class Assets {
        constructor() {
            this.images = new Map();
            this.loaded = 0;
            this.total = 0;
        }
        getImage(path) {
            if (this.images.has(path))
                return this.images.get(path);
            else
                throw `Failed to load ${path}`;
        }
        loadImage(path) {
            return new Promise((resolve, reject) => {
                if (this.images.has(path))
                    resolve(this.images.get(path));
                let loaded = false;
                const i = document.createElement("img");
                i.src = `assets/${path}`;
                this.images.set(path, i);
                this.total++;
                i.onload = (_) => {
                    loaded = true;
                    this.loaded++;
                    resolve(i);
                };
                i.onerror = (_) => {
                    reject(`Failed to load ${i.src}`);
                };
            });
        }
        load(assets) {
            return new Promise((resolve, _) => {
                for (const path of assets.images)
                    this.loadImage(path).then((_) => {
                        if (this.loaded >= this.total)
                            resolve(this);
                    });
                if (this.total <= 0)
                    resolve(this);
            });
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Assets;
});
//# sourceMappingURL=Assets.js.map