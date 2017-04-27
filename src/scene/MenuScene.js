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
define(["require", "exports", "../main", "./Scene", "../ui/Map", "../util/geom/Rectangle", "../util/geom/QuadTree"], function (require, exports, main_1, Scene_1, Map_1, Rectangle_1, QuadTree_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Text = PIXI.Text;
    var MenuScene = (function (_super) {
        __extends(MenuScene, _super);
        function MenuScene(name, buttons) {
            var _this = _super.call(this) || this;
            _this.title = new Text("", {
                align: 'left',
                fontSize: 70,
                dropShadow: true,
                dropShadowBlur: 5,
                dropShadowDistance: 0,
                fill: 'white'
            });
            _this.map = new Map_1.default(128, 128);
            _this.vel = [0, 0];
            _this.selected = -1;
            var r = main_1.default.instance.renderer;
            _this.buttons = buttons;
            _this.title.text = name;
            _this.title.position.set(r.width / 2 - _this.title.width / 2, 5);
            _this.title.cacheAsBitmap = true;
            _this.addUi(_this.title);
            _this.buttonTree = new QuadTree_1.default(new Rectangle_1.Rectangle(0, 0, r.width, r.height));
            for (var i = 0, button = buttons[0]; i < buttons.length; button = buttons[++i]) {
                button.scale.set(1, 1);
                button.position.set(r.width / 2 - button.width / 2, r.height * 0.95 - (i + 1) * (button.height + 10));
                _this.addUi(button);
                _this.buttonTree.insert(button);
            }
            var speed = MenuScene.SPEED;
            _this.vel[0] = Math.random() * speed;
            _this.vel[1] = Math.sqrt(speed * speed - _this.vel[0] * _this.vel[0]);
            _this.addNonUi(_this.map);
            _this.setCamera(_this.map.width / 2, _this.map.height / 2);
            _this.addEvent("keydown", function (e) {
                if (e.keyCode == 32 || e.keyCode == 13) {
                    _this.autoAdvance();
                    return;
                }
                if (_this.selected != -1)
                    _this.buttons[_this.selected].selected = false;
                if (e.keyCode == 40 && _this.selected == -1)
                    _this.selected = _this.buttons.length - 1;
                else if (e.keyCode == 40 && _this.selected > 0)
                    _this.selected--;
                else if (e.keyCode == 38 && _this.selected == -1)
                    _this.selected = 0;
                else if (e.keyCode == 38 && _this.selected < _this.buttons.length - 1)
                    _this.selected++;
                if (e.keyCode == 38 || e.keyCode == 40)
                    _this.buttons[_this.selected].selected = true;
            });
            _this.addEvent("mousedown", function (_) { return _this.autoAdvance(); });
            _this.addEvent("mousemove", function (e) {
                var eR = e;
                eR.width = 1;
                eR.height = 1;
                var a = _this.buttonTree.retrieve(eR);
                var btn = a.find(function (b) { return b.containsPoint(e); });
                for (var _i = 0, a_1 = a; _i < a_1.length; _i++) {
                    var btn2 = a_1[_i];
                    if (btn2.selected && btn2 != btn)
                        btn2.selected = false;
                }
                if (btn != null) {
                    btn.selected = true;
                    _this.selected = _this.buttons.indexOf(btn);
                }
                else {
                    _this.selected = -1;
                }
            });
            return _this;
        }
        MenuScene.prototype.autoAdvance = function () {
            if (this.selected != -1) {
                var button = this.buttons[this.selected];
                this.advance(button.listener(), button.destructive);
            }
        };
        MenuScene.prototype.update = function (dt) {
            var c = this.getCamera();
            var r = main_1.default.instance.renderer;
            c.x += this.vel[0] * dt;
            c.y += this.vel[1] * dt;
            if (c.x < r.width / 2)
                this.vel[0] = Math.abs(this.vel[0]);
            else if (c.x > this.map.width - r.width / 2)
                this.vel[0] = -Math.abs(this.vel[0]);
            if (c.y < r.height / 2)
                this.vel[1] = Math.abs(this.vel[1]);
            else if (c.y > this.map.height - r.height / 2)
                this.vel[1] = -Math.abs(this.vel[1]);
            var gs = navigator.getGamepads();
            for (var _i = 0, gs_1 = gs; _i < gs_1.length; _i++) {
                var g = gs_1[_i];
                if (g && g.buttons)
                    for (var b = 0; b < g.buttons.length; b++)
                        if (g.buttons[b].pressed)
                            this.autoAdvance();
            }
        };
        return MenuScene;
    }(Scene_1.default));
    MenuScene.SPEED = 169;
    exports.default = MenuScene;
});
