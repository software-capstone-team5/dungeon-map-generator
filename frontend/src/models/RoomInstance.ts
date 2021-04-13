import { RoomShape } from "../constants/RoomShape";
import { Size } from "../constants/Size";
import { Coordinates } from "./Coordinates";
import { RegionInstance } from "./RegionInstance";
import { RoomCategory } from "./RoomCategory";

export class RoomInstance extends RegionInstance {
	category: RoomCategory;
	size: Size;
	shape: RoomShape;
	isCorridor = false;

	getRoomSizeModifier(): number{
		var sizeModifier = 0;
		switch(this.size){
			case Size.small:
				sizeModifier = 1;
				break;
			case Size.medium:
				sizeModifier = 1.5;
				break;
			case Size.large:
				sizeModifier = 2;
		}
		return sizeModifier;
	}
}