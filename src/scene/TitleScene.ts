import Main from '../main';
import MenuScene from './MenuScene';
import Button from '../ui/Button';
import PlayScene from './PlayScene';
import CreditsScene from './CreditsScene';
import {Save, load} from '../util/save';
import Text = PIXI.Text;
/// The title scene, shown when the game loads
export default class TitleScene extends MenuScene {
	constructor() {
		super("Dungeonator 3000", [
			new Button('Credits', () => new CreditsScene(this)),
			new Button('Play', (input) => new PlayScene(input)),
		]);
		const r = Main.instance.renderer;
		const data: Save | undefined = load();
		if(data != undefined) {
			const t = new Text(`Highest floor: ${data.maxFloor}`, {
				fontSize: 40,
				fill: 'white'
			});
			t.position.set((r.width - t.width) / 2, (r.height - t.height) / 2);
			t.cacheAsBitmap = true;
			this.addUi(t);
		}
	}
}