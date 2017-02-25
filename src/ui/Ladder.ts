import PIXI = require("pixi.js");
import Sprite = PIXI.Sprite;

export default class Ladder extends Sprite {
    constructor() {
        const r = PIXI.loader.resources;
        super(r['ladder'].texture);
    }
}