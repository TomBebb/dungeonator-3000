define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Counter = (function () {
        function Counter() {
            this.callbacks = [];
        }
        Counter.prototype.update = function (dt) {
            for (var _i = 0, _a = this.callbacks; _i < _a.length; _i++) {
                var c = _a[_i];
                c.sinceLast += dt;
                if (c.sinceLast > c.interval) {
                    c.sinceLast -= c.interval;
                    c.callback();
                }
            }
        };
        Counter.prototype.clear = function () {
            this.callbacks.splice(0);
        };
        Counter.prototype.register = function (interval, cb) {
            this.callbacks.push({
                sinceLast: 0,
                interval: interval,
                callback: cb
            });
        };
        Counter.prototype.unregister = function (cb) {
            var i = this.callbacks.findIndex(function (v) { return v.callback == cb; });
            if (i != -1)
                this.callbacks.splice(i, 1);
        };
        return Counter;
    }());
    exports.default = Counter;
});
