///<reference path='../pixi.d.ts'/>
import Item from "./Item";
import { Player } from "./entities";
import Rectangle = PIXI.Rectangle;
import Texture = PIXI.Texture;
export default class Chest extends Item {
	private shutTexture: Texture;
	private openTexture: Texture;
	private open: boolean;
    constructor() {
	    const r = PIXI.loader.resources;
	    super(new Texture(r['chests'].texture.baseTexture, new Rectangle(16, 0, 16, 16)));
	    this.shutTexture = this.texture;
	    this.openTexture = new Texture(r['chests'].texture.baseTexture, new Rectangle(0, 0, 16, 16));
	    this.open = false;
    }
    interact(p: Player) {
    	if(!this.open) {
    		this.open = true;
    		this.texture = this.openTexture;
    	}
    	p;
    }
}