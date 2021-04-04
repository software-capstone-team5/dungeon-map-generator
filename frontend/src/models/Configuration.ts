import { CorridorComplexity } from "../constants/CorridorComplexity";
import { CorridorLength } from "../constants/CorridorLength";
import { Size } from "../constants/Size";
import { Probabilities } from "../generator/Probabilities";
import { CorridorCategory } from "./CorridorCategory";
import { RoomCategory } from "./RoomCategory";

export class Configuration {
	static maxDifficulty: number = 20;
	static minDifficulty: number = 1;
	name: string;
	mapSize: Size = Size.medium;
	corridorComplexity: CorridorComplexity = CorridorComplexity.medium;
	corridorLength: CorridorLength = CorridorLength.medium;
	difficulty: number = 5;
	roomCategories: Probabilities<RoomCategory> = new Probabilities<RoomCategory>(null);
	corridorCategories: Probabilities<CorridorCategory> = new Probabilities<CorridorCategory>(null);
	defaultRoomCategory: RoomCategory;
	defaultCorridorCategory: CorridorCategory;

	getMapSizeNum(): number{
		// TODO: Chose actual values
		switch(this.mapSize){
			case Size.small:
				return 10;
			case Size.medium:
				return 20;
			case Size.large:
				return 30;
		}
	}

	getMaxRooms(): number{
		// TODO: Chose actual values
		switch(this.mapSize){
			case Size.small:
				return 5;
			case Size.medium:
				return 10;
			case Size.large:
				return 15;
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
				return 8;
		}
	}

	getTurnChance(): number {
		// TODO: Chose actual values
		switch(this.corridorComplexity){
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
		switch(this.corridorLength){
			case (CorridorLength.short):
				return 10;
			case (CorridorLength.medium):
				return 15;
			case (CorridorLength.long):
				return 20;
		}
	}
}