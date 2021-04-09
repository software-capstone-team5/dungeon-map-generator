import { CorridorComplexity } from "../constants/CorridorComplexity";
import { CorridorLength } from "../constants/CorridorLength";
import { Size } from "../constants/Size";
import { Probabilities } from "../generator/Probabilities";
import { CorridorCategory } from "./CorridorCategory";
import { RoomCategory } from "./RoomCategory";
import { Type } from 'class-transformer';

export class Configuration {
	static maxDifficulty: number = 20;
	static minDifficulty: number = 1;
	id: string = "";
	name: string = "";
	mapSize: Size = Size.medium;
	corridorComplexity: CorridorComplexity = CorridorComplexity.medium;
	corridorLength: CorridorLength = CorridorLength.medium;
	difficulty: number = Configuration.maxDifficulty / 2;
	@Type(() => Probabilities)
	roomCategories: Probabilities<RoomCategory> = new Probabilities<RoomCategory>(null);
	@Type(() => Probabilities)
	corridorCategories: Probabilities<CorridorCategory> = new Probabilities<CorridorCategory>(null);
	defaultRoomCategory: RoomCategory;
	defaultCorridorCategory: CorridorCategory;

	getMapSizeNum(): number {
		// TODO: Chose actual values
		switch (this.mapSize) {
			case Size.small:
				return 10;
			case Size.medium:
				return 20;
			case Size.large:
				return 30;
		}
	}

	getMaxRooms(): number {
		// TODO: Chose actual values
		switch (this.mapSize) {
			case Size.small:
				return 3;
			case Size.medium:
				return 5;
			case Size.large:
				return 10;
		}
	}

	getTurnChance(): number {
		// TODO: Chose actual values
		switch (this.corridorComplexity) {
			case (CorridorComplexity.low):
				return 0.2;
			case (CorridorComplexity.medium):
				return 0.5;
			case (CorridorComplexity.high):
				return 0.8;
		}
	}

	getMaxLength(): number {
		// TODO: Chose actual values
		switch (this.corridorLength) {
			case (CorridorLength.short):
				return 5;
			case (CorridorLength.medium):
				return 10;
			case (CorridorLength.long):
				return 20;
		}
	}
}