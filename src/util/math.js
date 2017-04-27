define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function random(min, max) {
        return Math.floor(min + Math.random() * (max - min));
    }
    exports.random = random;
    function randomIn(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    exports.randomIn = randomIn;
    function clamp(v, min, max) {
        return Math.max(min, Math.min(v, max));
    }
    exports.clamp = clamp;
    function round(num, inc) {
        return Math.round(num / inc) * inc;
    }
    exports.round = round;
    function randomStep(min, max, inc) {
        return min + round(random(min, max) - min, inc);
    }
    exports.randomStep = randomStep;
    function intersects(x1, y1, w1, h1, x2, y2, w2, h2, spacing) {
        return Math.abs((x1 + w1 / 2) - (x2 + w2 / 2)) < (w1 + w2) / 2 + spacing
            && Math.abs((y1 + h1 / 2) - (y2 + h2 / 2)) < (h1 + h2) / 2 + spacing;
    }
    exports.intersects = intersects;
    function manhattanDistance(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
    exports.manhattanDistance = manhattanDistance;
    function rectContains(x1, y1, w1, h1, x2, y2) {
        return Math.abs(x1 + w1 / 2 - x2) < w1 / 2 && Math.abs(y1 + h1 / 2 - y2) < h1;
    }
    exports.rectContains = rectContains;
    function rectContainsRect(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x2 > x1 && y2 > y1 && x2 + w2 < x1 + w1 && y2 + h2 < y1 + h1;
    }
    exports.rectContainsRect = rectContainsRect;
});
