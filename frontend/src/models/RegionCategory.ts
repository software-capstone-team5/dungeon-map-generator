import { Type } from 'class-transformer';
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
	premade: boolean = false;
	@Type(() => Probabilities)
	tileSets: Probabilities<TileSet> | null;
	@Type(() => Probabilities)
	monsters: Probabilities<Monster> | null;
	@Type(() => Probabilities)
	states: Probabilities<MonsterState> | null;
	@Type(() => Probabilities)
	items: Probabilities<Item> | null;
	@Type(() => Probabilities)
	entranceTypes: Probabilities<EntranceType> | null;
	@Type(() => Probabilities)
	traps: Probabilities<Trap> | null;
	isCorridor = false;

	constructor() {
		this.states = Probabilities.buildUniform(Object.values(MonsterState));
		this.entranceTypes = Probabilities.buildUniform(Object.values(EntranceType));
		this.monsters = new Probabilities<Monster>(null);
		this.items = new Probabilities<Item>(null);
		this.traps = new Probabilities<Trap>(null);
		this.tileSets = new Probabilities<TileSet>(null);
	}

	canBeUsedAsDefault() : boolean {
		return Boolean(this.monsters && this.states && this.items && this.entranceTypes && this.traps && this.tileSets);
	}
}