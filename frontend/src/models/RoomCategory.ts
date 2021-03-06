import { Type } from 'class-transformer';
import { RoomShape } from "../constants/RoomShape";
import { Size } from "../constants/Size";
import { Probabilities } from "../generator/Probabilities";
import { RegionCategory } from "./RegionCategory";

export class RoomCategory extends RegionCategory {
	@Type(() => Probabilities)
	sizes: Probabilities<Size> | null;
	@Type(() => Probabilities)
	shapes: Probabilities<RoomShape> | null;
	isCorridor = false;

	constructor() {
		super()

		this.sizes = Probabilities.buildUniform(Object.values(Size));
		this.shapes = Probabilities.buildUniform(Object.values(RoomShape));
	}

	canBeUsedAsDefault() : boolean {
		return Boolean(super.canBeUsedAsDefault() && this.sizes && this.shapes);
	}
}