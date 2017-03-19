///<reference path='../pixi.d.ts'/>
import Item from "./Item";
import { Entity } from "./entities";
import Rectangle = PIXI.Rectangle;
import Texture = PIXI.Texture;
export default class Chest extends Item {
	private shutTexture: Texture;
	private openTexture: Texture;
	private open: boolean;
    constructor() {
	    const r = PIXI.loader.resources;
	    const t = r['chests'].texture.baseTexture;
	    super(new Texture(t, new Rectangle(16, 0, 16, 16)));
	    this.shutTexture = this.texture;
	    this.openTexture = new Texture(t, new Rectangle(0, 0, 16, 16));
	    this.open = false;
    }
    interact(e: Entity) {
    	if(!this.open) {
    		this.open = true;
    		this.texture = this.openTexture;
    	}
    	e;
    }
}