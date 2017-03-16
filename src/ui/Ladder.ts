///<reference path='../pixi.d.ts'/>
import Item from "./Item";
import { Player } from "./entities";
export default class Ladder extends Item {
    constructor() {
        super('ladder');
    }
    interact(p: Player) {
    	p.scene.advanceFloor();
    }
}