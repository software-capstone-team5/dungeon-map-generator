import { CorridorWidth } from "../constants/CorridorWidth";
import { Probabilities } from "../generator/Probabilities";
import { RegionCategory } from "./RegionCategory";

export class CorridorCategory extends RegionCategory {
	widths: Probabilities<CorridorWidth>;

	constructor() {
		super();

		this.widths = Probabilities.buildUniform(Object.values(CorridorWidth));
	}
}