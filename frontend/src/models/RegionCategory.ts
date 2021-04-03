import { EntranceType } from "../constants/EntranceType";
import { MonsterState } from "../constants/MonsterState";
import { Probabilities } from "../generator/Probabilities";
import { Item } from "./Item";
import { Monster } from "./Monster";
import { TileSet } from "./TileSet";
import { Trap } from "./Trap";

export class RegionCategory {
	id: string = "";
	name: string = "";
	tileSets: Probabilities<TileSet>;
	monsters: Probabilities<Monster>;
	states: Probabilities<MonsterState>;
	items: Probabilities<Item>;
	entranceTypes: Probabilities<EntranceType>;
	traps: Probabilities<Trap>;

	constructor() {
		this.states = new Probabilities<MonsterState>(null);
		var len = Object.values(MonsterState).length;
		Object.values(MonsterState).forEach((x: MonsterState) => {
			this.states.add(x, 1/len);
		});

		this.entranceTypes = new Probabilities<EntranceType>(null);
		var len = Object.values(EntranceType).length;
		Object.values(EntranceType).forEach((x:EntranceType) => {
			this.entranceTypes.add(x, 1/len);
		});

	}
}