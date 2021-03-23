import { RoomShape } from "../constants/RoomShape";
import { Size } from "../constants/Size";
import { Probabilities } from "../generator/Probabilities";
import { RegionCategory } from "./RegionCategory";

export class RoomCategory extends RegionCategory {
	sizes: Probabilities<Size>;
	shapes: Probabilities<RoomShape>;
}