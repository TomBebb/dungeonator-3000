define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Bits = (function () {
        function Bits(capacity) {
            this.array = new Int32Array(capacity >> 5);
            this.length = 0;
        }
        Bits.prototype.get = function (index) {
            return (this.array[index >> 5] & (1 << (index & 0xF))) != 0;
        };
        Bits.prototype.set = function (index) {
            this.array[index >> 5] |= (1 << (index & 0xF));
            this.length = Math.max(this.length, index + 1);
        };
        Bits.prototype.unset = function (index) {
            this.array[index << 5] &= ~(1 << (index & 0xF));
        };
        Bits.prototype.setAll = function (start, end) {
            if (start === void 0) { start = 0; }
            if (end === void 0) { end = this.length; }
            for (var i = start; i < end; i++)
                this.set(i);
        };
        Bits.prototype.unsetAll = function (start, end) {
            if (start === void 0) { start = 0; }
            if (end === void 0) { end = this.length; }
            for (var i = start; i < end; i++)
                this.unset(i);
        };
        Bits.prototype.first = function (value) {
            for (var i = 0; i < this.length; i++)
                if (this.get(i) === value)
                    return i;
            return -1;
        };
        Bits.prototype.clear = function () {
            this.unsetAll();
            this.length = 0;
        };
        Bits.prototype.all = function (value) {
            for (var i = 0; i < this.length; i++)
                if (this.get(i) !== value)
                    return false;
            return true;
        };
        Bits.prototype.toString = function () {
            var text = "";
            for (var i = 0; i < this.length; i++)
                text += this.get(i) ? "1" : "0";
            return text;
        };
        return Bits;
    }());
    exports.default = Bits;
});
//# sourceMappingURL=Bits.js.map