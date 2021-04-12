import { MonsterState } from "../constants/MonsterState";
import { Coordinates } from "./Coordinates";
import { Entrance } from "./Entrance";
import { Item } from "./Item";
import { Monster } from "./Monster";
import { TileSet } from "./TileSet";
import { Trap } from "./Trap";

export class RegionInstance {
	locations: Coordinates[] = [];
	tileSet: TileSet;
	monsters: Monster[] = [];
	state: MonsterState;
	items: Item[] = [];
	traps: Trap[] = [];
	entrances: Entrance[] = [];
	isCorridor = false;
	difficulty: number = 0;
}