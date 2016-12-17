define(["require", "exports"], function (require, exports) {
    "use strict";
    function random(min, max) {
        return Math.floor(min + Math.random() * (max - min));
    }
    exports.random = random;
    function round(num, inc) {
        return Math.round(num / inc) * inc;
    }
    exports.round = round;
    function randomStep(min, max, inc) {
        return min + round(random(min, max) - min, inc);
    }
    exports.randomStep = randomStep;
    function pointEq(a, b) {
        return a.x === b.x && a.y === b.y;
    }
    exports.pointEq = pointEq;
    function intersects(s, r, spacing) {
        return Math.abs((s.x + s.width / 2) - (r.x + r.width / 2)) < (s.width + r.width) / 2 + spacing
            && Math.abs((s.y + s.height / 2) - (r.y + r.height / 2)) < (s.height + r.height) / 2 + spacing;
    }
    exports.intersects = intersects;
    function distSquared(a, b) {
        return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
    }
    exports.distSquared = distSquared;
    function manhattanDistance(p, g) {
        return Math.abs(p.x - g.x) + Math.abs(p.y - g.y);
    }
    exports.manhattanDistance = manhattanDistance;
});
//# sourceMappingURL=math.js.map