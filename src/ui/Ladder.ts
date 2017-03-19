import Item from "./Item";
import { Entity } from "./entities";
export default class Ladder extends Item {
    constructor() {
	    const r = PIXI.loader.resources;
	    super(r['ladder'].texture);
    }
    interact(e: Entity) {
    	e.scene.advanceFloor();
    }
}