define(["require", "exports", "../Camera", "../Generator", "../Grid", "../control", "../entities", "../util/math"], function (require, exports, Camera_1, Generator_1, Grid_1, control_1, entities_1, math_1) {
    "use strict";
    class PlayScene {
        constructor(assets) {
            this.delay = 0.5;
            this.sinceLast = 0;
            this.gen = new Generator_1.default();
            this.entities = [];
            this.camera = new Camera_1.default();
            this.assets = assets;
            this.grid = new Grid_1.default(64, 64, this.assets);
            this.entities.push(entities_1.Entity.defaultPlayer(this, this.assets));
            this.entities.push(entities_1.Entity.defaultEnemy(this, this.assets));
            this.camera.follow = this.entities[0];
            for (const entity of this.entities)
                this.place(entity);
            window.addEventListener("ongamepadconnected", (ge) => {
                const player = new entities_1.Entity(this, new control_1.GamepadControl(ge.gamepad), assets);
                this.entities.push(player);
                this.camera.follow = player;
            });
            window.addEventListener("ongamepaddisconnected", (ge) => {
                for (let i = 0; i < this.entities.length; i++) {
                    const e = this.entities[i];
                    if (e.control instanceof Gamepad && e.control.index == ge.gamepad.index)
                        this.entities.splice(i);
                }
            });
            const n = navigator;
            if (n.publishServer != null) {
                n.publishServer('Game session', {}).then((server) => {
                    server.onfetch = (event) => {
                        const html = `<h1>Game controller</h1>
                        '<h3>You requested ${event.request.url} </h3>`;
                        event.respondWith(new Response(html, {
                            headers: { 'Content-Type': 'text/html' }
                        }));
                    };
                });
            }
            this.gen.grid = this.grid;
            this.reset();
        }
        isValidPosition(x, y) {
            if (!this.grid.isValidPosition(x, y))
                return false;
            for (let e of this.entities)
                if (e.x === x && e.y === y)
                    return false;
            return true;
        }
        reset() {
            this.gen.generate();
            this.grid.internalDraw();
        }
        place(p, numAttempts = 5) {
            do {
                p.x = math_1.random(1, this.grid.width - 2);
                p.y = math_1.random(1, this.grid.height - 2);
            } while (!this.isValidPosition(p.x, p.y) && numAttempts-- > 0);
        }
        render(c) {
            c.save();
            c.fillStyle = "#dcd";
            c.fillRect(0, 0, c.canvas.width, c.canvas.height);
            this.camera.apply(c);
            this.grid.render(c);
            for (const e of this.entities)
                e.draw(c);
            c.restore();
        }
        update(dt) {
            for (const e of this.entities)
                e.update(dt);
            this.sinceLast += dt;
            if (this.sinceLast >= this.delay) {
                this.sinceLast -= this.delay;
                for (const e of this.entities)
                    e.step();
            }
            setTimeout(this.update.bind(this, dt), dt);
        }
    }
    PlayScene.TILE_SIZE = 16;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = PlayScene;
});
//# sourceMappingURL=PlayScene.js.map