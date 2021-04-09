import { CorridorWidth } from "../constants/CorridorWidth";
import { Probabilities } from "../generator/Probabilities";
import { RegionCategory } from "./RegionCategory";
import { Type } from 'class-transformer';

export class CorridorCategory extends RegionCategory {
	@Type(() => Probabilities)
	widths: Probabilities<CorridorWidth>;

	constructor() {
		super();

		this.widths = Probabilities.buildUniform(Object.values(CorridorWidth));
	}
}