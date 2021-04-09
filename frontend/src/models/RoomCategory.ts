import { RoomShape } from "../constants/RoomShape";
import { Size } from "../constants/Size";
import { Probabilities } from "../generator/Probabilities";
import { RegionCategory } from "./RegionCategory";
import { Type } from 'class-transformer';

export class RoomCategory extends RegionCategory {
	@Type(() => Probabilities)
	sizes: Probabilities<Size>;
	@Type(() => Probabilities)
	shapes: Probabilities<RoomShape>;

	constructor() {
		super()

		this.sizes = Probabilities.buildUniform(Object.values(Size));
		this.shapes = Probabilities.buildUniform(Object.values(RoomShape));
	}
}