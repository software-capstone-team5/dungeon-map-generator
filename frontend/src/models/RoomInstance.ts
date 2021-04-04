import { RoomShape } from "../constants/RoomShape";
import { Size } from "../constants/Size";
import { Coordinates } from "./Coordinates";
import { RegionInstance } from "./RegionInstance";
import { RoomCategory } from "./RoomCategory";

export class RoomInstance extends RegionInstance {
	start: Coordinates;
	category: RoomCategory;
	size: Size;
	shape: RoomShape;
	isCorridor = false;
}