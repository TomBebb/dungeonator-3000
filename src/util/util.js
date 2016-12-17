define(["require", "exports"], function (require, exports) {
    "use strict";
    function lowest(iter, cb) {
        let value = null;
        let valueCost = Infinity;
        let next;
        while ((next = iter.next()) != null) {
            if (next != null && cb(next.value) < valueCost) {
                value = next.value;
                valueCost = cb(next.value);
                if (next.done)
                    break;
            }
        }
        return value;
    }
    exports.lowest = lowest;
});
//# sourceMappingURL=util.js.map