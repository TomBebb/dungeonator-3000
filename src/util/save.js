define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function load() {
        var d = localStorage.getItem(SAVE_ID);
        if (d == undefined)
            return undefined;
        else
            return JSON.parse(d);
    }
    exports.load = load;
    function save(s) {
        localStorage.setItem(SAVE_ID, JSON.stringify(s));
    }
    exports.save = save;
    var SAVE_ID = "dungeonator-3000";
});
