///<reference path='../pixi.d.ts'/>
import Item from "./Item";
import { Coin, Entity } from "./entities";
import { FollowInput } from "../util/input";
import Rectangle = PIXI.Rectangle;
import Texture = PIXI.Texture;

/// A treasure chest, which grants a player a coin.
export default class Chest extends Item {
    /// The texture to display when this chest is shut.
    private shutTexture: Texture;
    /// The texture to display when this chest is open.
    private openTexture: Texture;
    private coin: Coin | undefined;
    constructor() {
        // Fetch the texture
        const r = PIXI.loader.resources;
        const t = r['chests'].texture.baseTexture;
        super(new Texture(t, new Rectangle(16, 0, 16, 16)));
        this.shutTexture = this.texture;
        this.openTexture = new Texture(t, new Rectangle(0, 0, 16, 16));
    }
    /// Check if this is open
    get open(): boolean {
        // Return true when this texture is the open texture.
        return this.texture == this.openTexture;
    }
    /// Open the chest if it hasn't been opened.
    interact(e: Entity<any>) {
        // If the chest is closed and the entity interacting isn't an enemy
        if (!this.open && !(e.input instanceof FollowInput)) {
            // Mark as open
            this.texture = this.openTexture;
            // Make a coin
            this.coin = new Coin(e.scene, this.x, this.y - 16);
            e.scene.coins += 1;
            e.scene.addNonUi(this.coin);
        }
    }
    update(dt: number) {
        // If there is a coin coming out of this, update it.
        if (this.coin != undefined)
            this.coin.update(dt);
    }
}