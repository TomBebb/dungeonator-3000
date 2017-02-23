define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var HashMap = (function () {
        function HashMap(_default) {
            if (_default === void 0) { _default = undefined; }
            this._ = new Map();
            this.keys = [];
            this._default = _default;
        }
        HashMap.prototype.clear = function () {
            this._.clear();
            this.keys.splice(0);
        };
        HashMap.prototype.delete = function (key) {
            this._.delete(key.hash());
            this.keys.splice(this.keys.indexOf(key), 1);
        };
        HashMap.prototype.has = function (key) {
            return this._.has(key.hash());
        };
        HashMap.prototype.get = function (key) {
            if (!this.has(key))
                return this._default;
            return this._.get(key.hash());
        };
        HashMap.prototype.set = function (key, value) {
            this._.set(key.hash(), value);
        };
        return HashMap;
    }());
    exports.default = HashMap;
});
//# sourceMappingURL=HashMap.js.map