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
	value: number = 0;
	name: string = "0";
	start: Coordinates;

	move(newStart: Coordinates){
		var diff = newStart.subtract(this.start);
		if (diff.x !== 0 || diff.y !== 0){
			this.locations.forEach((location, index, array) => {
				array[index] = location.add(diff);
			});

			this.entrances.forEach((entrance, index, array) => {
				array[index].location = entrance.location.add(diff);
			});
		}
		this.start = newStart;
	}

	findEntrance(point: Coordinates){
		return this.entrances.find((x) => x.location.toString() === point.toString());
	}
}