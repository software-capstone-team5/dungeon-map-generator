import { CorridorWidth } from "../constants/CorridorWidth";
import { CorridorCategory } from "./CorridorCategory";
import { RegionInstance } from "./RegionInstance";

export class CorridorInstance extends RegionInstance {
	category: CorridorCategory;
	width: CorridorWidth;
}