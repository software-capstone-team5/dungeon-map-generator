import { CorridorComplexity } from "../constants/CorridorComplexity";
import { CorridorLength } from "../constants/CorridorLength";
import { Size } from "../constants/Size";
import { CorridorCategory } from "./CorridorCategory";
import { RoomCategory } from "./RoomCategory";

export class Configuration {
	static maxDifficulty: number;
	static minDifficulty: number;
	name: string;
	mapSize: Size;
	corridorComplexity: CorridorComplexity;
	corridorLength: CorridorLength;
	difficulty: number;
	roomCategories: Map<RoomCategory, number>;
	corridorCategories: Map<CorridorCategory, number>;
	defaultRoomCategory: RoomCategory;
	defaultCorridorCategory: CorridorCategory;
}