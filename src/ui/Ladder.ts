import Item from "./Item";
import { Player } from "./entities";
export default class Ladder extends Item {
    constructor() {
	    const r = PIXI.loader.resources;
	    super(r['ladder'].texture);
    }
    interact(p: Player) {
    	p.scene.advanceFloor();
    }
}