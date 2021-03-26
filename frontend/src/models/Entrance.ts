import { EntranceType } from "../constants/EntranceType";
import { Coordinates } from "./Coordinates";

export class Entrance {
	type: EntranceType;
	location: Coordinates;

	constructor(type: EntranceType, location: Coordinates){
		this.location = location;
		this.type = type;
	}
}