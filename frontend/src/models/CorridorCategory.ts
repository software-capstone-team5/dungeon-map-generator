import { Type } from 'class-transformer';
import { CorridorWidth } from "../constants/CorridorWidth";
import { Probabilities } from "../generator/Probabilities";
import { RegionCategory } from "./RegionCategory";

export class CorridorCategory extends RegionCategory {
	@Type(() => Probabilities)
	widths: Probabilities<CorridorWidth> | null;
	isCorridor = true;

	constructor() {
		super();

		this.widths = Probabilities.buildUniform(Object.values(CorridorWidth));
	}

	canBeUsedAsDefault() : boolean {
		return Boolean(super.canBeUsedAsDefault() && this.widths);
	}
}