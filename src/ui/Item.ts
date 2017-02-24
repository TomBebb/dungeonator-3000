import Sprite = PIXI.Sprite;
import { Entity } from "./entities";
type ItemKind = "ladder";

export default class Item extends Sprite {
    constructor(kind: ItemKind, x: number = 0, y: number = 0) {
        super(PIXI.loader.resources[kind].data);
        this.x = x;
        this.y = y;
    }
    onEntityTouch(e: Entity) {
        e;
    }
}