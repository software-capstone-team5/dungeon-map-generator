import { CorridorWidth } from "../constants/CorridorWidth";
import { Probabilities } from "../generator/Probabilities";
import { RegionCategory } from "./RegionCategory";

export class CorridorCategory extends RegionCategory {
	widths: Probabilities<CorridorWidth>;

	constructor() {
		super();

		this.widths = new Probabilities<CorridorWidth>(null);
		var len = Object.values(CorridorWidth).length;
		Object.values(CorridorWidth).forEach((x: CorridorWidth) => {
			this.widths.add(x, 1/len);
		});
	}
}