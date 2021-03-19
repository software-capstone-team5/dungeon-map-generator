import { CorridorWidth } from "../constants/CorridorWidth";
import { RegionInstance } from "./RegionInstance";

export class CorridorInstance extends RegionInstance {
	category: CorridorInstance;
	corridorWidth: CorridorWidth;
}