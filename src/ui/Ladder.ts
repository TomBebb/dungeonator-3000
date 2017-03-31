import Item from "./Item";
import Entity from "./Entity";
/// A ladder, which advances the floor when interacted with.
export default class Ladder extends Item {
    constructor() {
        const r = PIXI.loader.resources;
        super(r['ladder'].texture);
    }
    // When an entity interacts with this..
    interact(e: Entity<any>) {
        // Advance the dungeon floor
        e.scene.advanceFloor();
    }
}