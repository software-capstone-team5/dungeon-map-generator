import { EntranceType } from "../constants/EntranceType";
import { MonsterState } from "../constants/MonsterState";
import { Probabilities } from "../generator/Probabilities";
import { Item } from "./Item";
import { Monster } from "./Monster";
import { TileSet } from "./TileSet";
import { Trap } from "./Trap";
import { Type } from 'class-transformer';

export class RegionCategory {
	id: string = "";
	name: string = "";
	@Type(() => Probabilities)
	tileSets: Probabilities<TileSet>;
	@Type(() => Probabilities)
	monsters: Probabilities<Monster>;
	@Type(() => Probabilities)
	states: Probabilities<MonsterState>;
	@Type(() => Probabilities)
	items: Probabilities<Item>;
	@Type(() => Probabilities)
	entranceTypes: Probabilities<EntranceType>;
	@Type(() => Probabilities)
	traps: Probabilities<Trap>;

	constructor() {
		this.states = Probabilities.buildUniform(Object.values(MonsterState));
		this.entranceTypes = Probabilities.buildUniform(Object.values(EntranceType));
		this.monsters = new Probabilities<Monster>(null);
		this.items = new Probabilities<Item>(null);
		this.traps = new Probabilities<Trap>(null);
	}
}