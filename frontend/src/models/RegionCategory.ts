import { EntranceType } from "../constants/EntranceType";
import { MonsterState } from "../constants/MonsterState";
import { Probabilities } from "../generator/Probabilities";
import { Item } from "./Item";
import { Monster } from "./Monster";
import { TileSet } from "./TileSet";
import { Trap } from "./Trap";

export class RegionCategory {
	name: string;
	tileSets: Probabilities<TileSet> | null;
	monsters: Probabilities<Monster> | null;
	states: Probabilities<MonsterState> | null;
	items: Probabilities<Item> | null;
	entranceTypes: Probabilities<EntranceType> | null;
	traps: Probabilities<Trap> | null;
	isCorridor = false;
}