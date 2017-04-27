var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "../util/math"], function (require, exports, math_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Container = PIXI.Container;
    var PText = PIXI.Text;
    var Graphics = PIXI.Graphics;
    var Button = (function (_super) {
        __extends(Button, _super);
        function Button(name, listener, destructive, bg, selectBg, fg, w, h) {
            if (destructive === void 0) { destructive = true; }
            if (bg === void 0) { bg = 0xFFFFFF; }
            if (selectBg === void 0) { selectBg = 0xC0C0C0; }
            if (fg === void 0) { fg = 'black'; }
            if (w === void 0) { w = 200; }
            if (h === void 0) { h = 60; }
            var _this = _super.call(this) || this;
            _this.bg = new Graphics();
            _this.label = new PText("", {
                align: 'center',
                fontSize: 40,
                dropShadow: true,
                dropShadowBlur: 5,
                dropShadowDistance: 0
            });
            _this.destructive = destructive;
            _this.listener = listener;
            _this.label.style.fill = fg;
            _this.label.text = name;
            _this.addChild(_this.bg);
            _this.bg.beginFill(0xFFFFFFFF);
            _this.bg.drawRoundedRect(0, 0, w, h, 8);
            _this.bg.endFill();
            _this.bg.tint = bg;
            _this.normalBg = bg;
            _this.selectedBg = selectBg;
            _this.label.x = (w - _this.label.width) / 2;
            _this.label.y = (h - _this.label.height) / 2;
            _this.addChild(_this.label);
            _this.cacheAsBitmap = true;
            return _this;
        }
        Object.defineProperty(Button.prototype, "selected", {
            get: function () {
                return this.bg.tint == this.selectedBg;
            },
            set: function (s) {
                this.cacheAsBitmap = false;
                this.bg.tint = s ? this.selectedBg : this.normalBg;
                this.cacheAsBitmap = true;
            },
            enumerable: true,
            configurable: true
        });
        Button.prototype.containsPoint = function (p) {
            return math_1.rectContains(this.x, this.y, this.width, this.height, p.x, p.y);
        };
        return Button;
    }(Container));
    exports.default = Button;
});
