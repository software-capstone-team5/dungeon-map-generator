import { Direction } from "../constants/Direction";
import { EntranceType } from "../constants/EntranceType";
import { Coordinates } from "./Coordinates";

export class Entrance {
	name: string; // This is for NameList and is usually just the index
	type: EntranceType;
	location: Coordinates;
	direction: Direction;

	constructor(type: EntranceType = EntranceType.regular, location: Coordinates = new Coordinates(0,0), direction: Direction = Direction.right) {
		this.location = location;
		this.type = type;
		this.direction = direction;
	}
}