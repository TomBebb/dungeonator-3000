define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var HashSet = (function () {
        function HashSet() {
            this._ = new Set();
        }
        HashSet.prototype.clear = function () {
            this._.clear();
        };
        HashSet.prototype.delete = function (value) {
            this._.delete(value.hash());
        };
        HashSet.prototype.has = function (value) {
            return this._.has(value.hash());
        };
        HashSet.prototype.add = function (value) {
            this._.add(value.hash());
        };
        return HashSet;
    }());
    exports.default = HashSet;
});
