import { Type } from 'class-transformer';
import { CorridorComplexity } from "../constants/CorridorComplexity";
import { CorridorLength } from "../constants/CorridorLength";
import { Size } from "../constants/Size";
import { Probabilities } from "../generator/Probabilities";
import { CorridorCategory } from "./CorridorCategory";
import { RoomCategory } from "./RoomCategory";

export class Configuration {
	static maxDifficulty: number = 20;
	static minDifficulty: number = 1;
	id: string = "";
	name: string = "";
	premade: boolean = false;
	mapSize: Size = Size.medium;
	corridorComplexity: CorridorComplexity = CorridorComplexity.medium;
	corridorLength: CorridorLength = CorridorLength.medium;
	difficulty: number = Configuration.maxDifficulty / 2;
	@Type(() => Probabilities)
	roomCategories: Probabilities<RoomCategory> = new Probabilities<RoomCategory>(null);
	@Type(() => Probabilities)
	corridorCategories: Probabilities<CorridorCategory> = new Probabilities<CorridorCategory>(null);
	@Type(() => RoomCategory)
	defaultRoomCategory: RoomCategory;
	@Type(() => CorridorCategory)
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
				return 5;
			case Size.medium:
				return 10;
			case Size.large:
				return 40;
		}
	}

	getMinRooms(): number{
		// TODO: Chose actual values
		switch(this.mapSize){
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
				return 0.1;
			case (CorridorComplexity.medium):
				return 0.2;
			case (CorridorComplexity.high):
				return 0.4;
		}
	}

	getMaxLength(): number {
		// TODO: Chose actual values
		switch (this.corridorLength) {
			case (CorridorLength.short):
				return 10;
			case (CorridorLength.medium):
				return 15;
			case (CorridorLength.long):
				return 20;
		}
	}
}