import { Direction } from "../constants/Direction";
import { EntranceType } from "../constants/EntranceType";
import { Coordinates } from "./Coordinates";

export class Entrance {
	type: EntranceType;
	location: Coordinates;
	direction: Direction;

	constructor(type: EntranceType, location: Coordinates, direction: Direction) {
		this.location = location;
		this.type = type;
		this.direction = direction;
	}
}