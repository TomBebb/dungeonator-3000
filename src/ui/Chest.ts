///<reference path='../pixi.d.ts'/>
import Item from "./Item";
import {Coin, Entity}  from "./entities";
import { FollowInput } from "../util/input";
import Rectangle = PIXI.Rectangle;
import Texture = PIXI.Texture;

/// A treasure chest.
export default class Chest extends Item {
	private shutTexture: Texture;
	private openTexture: Texture;
	private open: boolean;
	private coin: Coin | undefined;
    constructor() {
	    const r = PIXI.loader.resources;
	    const t = r['chests'].texture.baseTexture;
	    super(new Texture(t, new Rectangle(16, 0, 16, 16)));
	    this.shutTexture = this.texture;
	    this.openTexture = new Texture(t, new Rectangle(0, 0, 16, 16));
	    this.open = false;
    }
    interact(e: Entity<any>) {
        // If the chest is closed and the entity interacting isn't an enemy
    	if(!this.open && !(e.input instanceof FollowInput)) {
            // Mark as open
    		this.open = true;
    		this.texture = this.openTexture;
            // Make a coin
    		this.coin = new Coin(e.scene, this.x, this.y - 16);
            e.scene.coins += 1;
       		e.scene.addNonUi(this.coin);
    	}
    }
    update(dt: number) {
        if(this.coin != undefined)
            this.coin.update(dt);
    }
}