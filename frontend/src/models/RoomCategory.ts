import { RoomShape } from "../constants/RoomShape";
import { Size } from "../constants/Size";
import { Probabilities } from "../generator/Probabilities";
import { RegionCategory } from "./RegionCategory";

export class RoomCategory extends RegionCategory {
	sizes: Probabilities<Size>;
	shapes: Probabilities<RoomShape>;

	constructor() {
		super()

		this.sizes = new Probabilities<Size>(null);
		var len = Object.values(Size).length;
		Object.values(Size).forEach((x: Size) => {
			this.sizes.add(x, 1/len);
		});

		this.shapes = new Probabilities<RoomShape>(null);
		len = Object.values(RoomShape).length;
		Object.values(RoomShape).forEach((x: RoomShape) => {
			this.shapes.add(x, 1/len);
		});
	}
}