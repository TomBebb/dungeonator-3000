define(["require", "exports"], function (require, exports) {
    "use strict";
    class LoadingScene {
        constructor() {
        }
        render(c) {
            c.fillStyle = '#1e2f0a';
            const [w, h] = [c.canvas.width, c.canvas.height];
            c.fillRect(0, 0, w, h);
            c.fillStyle = 'white';
            c.font = '20px sans';
            const tw = c.measureText(LoadingScene.TEXT);
            c.fillText(LoadingScene.TEXT, (w - tw.width) / 2, (h - 20) / 2);
        }
        update(_) {
        }
    }
    LoadingScene.TEXT = "Loading";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = LoadingScene;
});
//# sourceMappingURL=LoadingScene.js.map