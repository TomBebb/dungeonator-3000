define(["require", "exports", "./Sprite"], function (require, exports, Sprite_1) {
    "use strict";
    class Label extends Sprite_1.default {
        constructor(text = "", color = "white", font = "8px sans", x = 0, y = 0) {
            super(x, y);
            this._text = text;
            this.buffer = document.createElement("canvas");
            this.buffer.width = 200;
            this.buffer.height = 20;
            document.body.appendChild(this.buffer);
            this.context = this.buffer.getContext("2d");
            this.context.font = font;
            this.context.fillStyle = color;
            this.text = text;
        }
        get width() {
            return this.buffer.width;
        }
        get height() {
            return this.buffer.height;
        }
        set text(v) {
            this._text = v;
            const m = this.context.measureText(v);
            this.buffer.width = m.width;
            this.context = this.buffer.getContext("2d");
            const c = this.context;
            c.clearRect(0, 0, this.buffer.width, this.buffer.height);
            c.fillText(v, 0, this.buffer.height);
        }
        get text() {
            return this._text;
        }
        draw(c) {
            c.drawImage(this.buffer, this.x, this.y);
        }
        update(_) { }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Label;
});
//# sourceMappingURL=Label.js.map