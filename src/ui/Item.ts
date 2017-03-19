///<reference path='../pixi.d.ts'/>
import Sprite = PIXI.Sprite;
import Entity from "./entities";

export default class Item extends Sprite {
    interact(e: Entity<any>) {
    	e;
    }
}