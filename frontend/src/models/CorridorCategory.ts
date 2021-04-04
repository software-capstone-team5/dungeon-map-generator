import { CorridorWidth } from "../constants/CorridorWidth";
import { Probabilities } from "../generator/Probabilities";
import { RegionCategory } from "./RegionCategory";

export class CorridorCategory extends RegionCategory {
	widths: Probabilities<CorridorWidth> | null;
	isCorridor = true;
}