///<reference path='../pixi.d.ts'/>
import Sprite = PIXI.Sprite;
import {Player} from "./entities";

export default class Item extends Sprite {
    constructor(name: string) {
        const r = PIXI.loader.resources;
        super(r[name].texture);
    }
    interact(p: Player) {
    	p;
    }
}