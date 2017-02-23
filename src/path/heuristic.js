define(["require", "exports"], function (require, exports) {
    "use strict";
    function manhattan(node, goal) {
        return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
    }
    exports.manhattan = manhattan;
});
//# sourceMappingURL=heuristic.js.map