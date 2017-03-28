///<reference path='../pixi.d.ts'/>
import Sprite = PIXI.Sprite;
import Entity from "./entities";

/// An item in a dungeon, that can be found in it and interacted with.
export default class Item extends Sprite {
    /// Called when an entity interacts with this item.
    interact(e: Entity<any>) {
        e;
    }
}