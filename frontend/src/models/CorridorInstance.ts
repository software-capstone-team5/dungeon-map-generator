import { CorridorWidth } from "../constants/CorridorWidth";
import { CorridorCategory } from "./CorridorCategory";
import { RegionInstance } from "./RegionInstance";

export class CorridorInstance extends RegionInstance {
	category: CorridorCategory;
	width: CorridorWidth;
	isCorridor = true;

	getWidthModifier(): number{
		var widthModifier = 0;
		switch(this.width){
			case CorridorWidth.thin:
				widthModifier = 1;
				break;
			case CorridorWidth.medium:
				widthModifier = 2;
				break;
			case CorridorWidth.wide:
				widthModifier = 3;
		}
		return widthModifier;
	}
}