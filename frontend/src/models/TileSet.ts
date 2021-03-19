import { TileType } from "../constants/TileType";

export class TileSet {
	name: string;
	set: Map<TileType, string>; // string is image url? Better way to represent this for react?

	addTileToSet(tileType: TileType, img: string) {
		this.set[tileType] = img;
	}

	get(tileType: TileType){
		return this.set[tileType];
	}
}