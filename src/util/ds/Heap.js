define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Heap = (function () {
        function Heap(score) {
            this.content = [];
            this.score = score;
        }
        Object.defineProperty(Heap.prototype, "size", {
            get: function () {
                return this.content.length;
            },
            enumerable: true,
            configurable: true
        });
        Heap.prototype.clear = function () {
            this.content.splice(0);
        };
        Heap.prototype.push = function (elem) {
            this.content.push(elem);
            this.sinkDown(this.content.length - 1);
        };
        Heap.prototype.pop = function () {
            if (this.content.length == 0)
                return undefined;
            var result = this.content[0];
            var end = this.content.pop();
            if (this.content.length > 0) {
                this.content[0] = end;
                this.bubbleUp(0);
            }
            return result;
        };
        Heap.prototype.rescoreElement = function (elem) {
            var i = this.content.findIndex(function (e) { return e == elem; });
            this.sinkDown(i);
        };
        Heap.prototype.sinkDown = function (n) {
            var elem = this.content[n];
            while (n > 0) {
                var parentN = ((n + 1) >> 1) - 1;
                var parent_1 = this.content[parentN];
                if (this.score(elem) < this.score(parent_1)) {
                    this.content[parentN] = elem;
                    this.content[n] = parent_1;
                    n = parentN;
                }
                else {
                    break;
                }
            }
        };
        Heap.prototype.bubbleUp = function (n) {
            var length = this.content.length, elem = this.content[n], score = this.score, elemScore = score(elem);
            while (true) {
                var child2N = (n + 1) << 1;
                var child1N = child2N - 1;
                var swap = -1;
                var child1Score = undefined;
                if (child1N < length) {
                    var child = this.content[child1N];
                    child1Score = score(child);
                    if (child1Score < elemScore)
                        swap = child1N;
                }
                if (child2N < length) {
                    var child = this.content[child2N];
                    var score2Score = score(child);
                    if (score2Score < (swap == -1 ? elemScore : child1Score))
                        swap = child2N;
                }
                if (swap != -1) {
                    this.content[n] = this.content[swap];
                    this.content[swap] = elem;
                    n = swap;
                }
                else {
                    break;
                }
            }
        };
        return Heap;
    }());
    exports.default = Heap;
});
