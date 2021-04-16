import { MonsterState } from "../constants/MonsterState";
import { Entrance } from "./Entrance";
import { Item } from "./Item";
import { Monster } from "./Monster";
import { RegionInstance } from "./RegionInstance";
import { Trap } from "./Trap";

export class RegionContent {
	name: string = "0";
	difficulty: number = 0;
	value: number = 0;
	monsters: Monster[] = [];
	state: MonsterState;
	items: Item[] = [];
	traps: Trap[] = [];
	entrances: Entrance[] = [];

	constructor(regionInstance: RegionInstance){
		this.name = regionInstance.name;
		this.difficulty = regionInstance.difficulty;
		this.value = regionInstance.value;
		this.monsters = regionInstance.monsters;
		this.state = regionInstance.state;
		this.items = regionInstance.items;
		this.traps = regionInstance.traps;
		this.entrances = regionInstance.entrances;
	}
}