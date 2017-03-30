import Main from '../main';
import MenuScene from './MenuScene';
import Button from '../ui/Button';
import PlayScene from './PlayScene';
import CreditsScene from './CreditsScene';
import { Save, load } from '../util/save';
import Text = PIXI.Text;
/// The title scene, shown when the game loads
export default class TitleScene extends MenuScene {
    constructor() {
        super("Dungeonator 3000", [
            new Button('Credits', () => new CreditsScene(this), false),
            new Button('Play', () => new PlayScene(), true),
        ]);
        const r = Main.instance.renderer;
        const data: Save | undefined = load();
        if (data != undefined) {
            const floor = new Text(`Highest floor: ${data.maxFloor}`, {
                fontSize: 40,
                fill: 'white'
            });
            floor.position.set((r.width - floor.width) / 2, (r.height - floor.height) / 2);
            floor.cacheAsBitmap = true;
            this.addUi(floor);
            const coins = new Text(`Coins: ${data.coins}`, {
                fontSize: 40,
                fill: 'white'
            });
            coins.position.set((r.width - coins.width) / 2, r.height * 0.3);
            coins.cacheAsBitmap = true;
            this.addUi(coins);
        }
    }
}