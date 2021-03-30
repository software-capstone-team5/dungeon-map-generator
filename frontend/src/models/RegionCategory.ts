import { EntranceType } from "../constants/EntranceType";
import { MonsterState } from "../constants/MonsterState";
import { Probabilities } from "../generator/Probabilities";
import { Item } from "./Item";
import { Monster } from "./Monster";
import { TileSet } from "./TileSet";
import { Trap } from "./Trap";

export class RegionCategory {
	name: string;
	tileSets: Probabilities<TileSet>;
	monsters: Probabilities<Monster>;
	states: Probabilities<MonsterState>;
	items: Probabilities<Item>;
	entranceTypes: Probabilities<EntranceType>;
	traps: Probabilities<Trap>;
}