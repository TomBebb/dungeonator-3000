import PlayScene from "./scene/PlayScene";
import DisplayObject = PIXI.DisplayObject;

/// Manages the transformations that apply to the canvas
export default class Camera extends PIXI.Transform {
    /// The object the camera will follow
    follow: DisplayObject | undefined;
    constructor(follow?: DisplayObject) {
        super();
        this.scale.set(2, 2);
        this.follow = follow;
    }
    update() {
        if(this.follow !== undefined) {
            this.position.set((this.follow.x + 0.5) * PlayScene.TILE_SIZE, (this.follow.y + 0.5) * PlayScene.TILE_SIZE);
        }
    }
}
