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
		this.states = Probabilities.buildUniform(Object.values(MonsterState));
		this.entranceTypes = Probabilities.buildUniform(Object.values(EntranceType));
		this.monsters = new Probabilities<Monster>(null);
		this.items = new Probabilities<Item>(null);
		this.traps = new Probabilities<Trap>(null);
	}
}