import { RoomShape } from "../constants/RoomShape";
import { Size } from "../constants/Size";
import { Probabilities } from "../generator/Probabilities";
import { RegionCategory } from "./RegionCategory";

export class RoomCategory extends RegionCategory {
	constructor() {
		super()

		this.sizes = new Probabilities<Size>(null);
		var len = Object.values(Size).length;
		Object.values(Size).forEach((x: Size) => {
			this.sizes.add(x, 1/len);
		});
		
	}
	sizes: Probabilities<Size>;
	shapes: Probabilities<RoomShape>;
}