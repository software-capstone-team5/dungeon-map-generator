export class TileSet {
	id: string = "";
	name: string;
	tileSize: number = 48;
	set: Map<string, HTMLImageElement> = new Map<string, HTMLImageElement>(); // key is TileType, value is image url? Better way to represent this for react?

	constructor(name: string, tileSize: number, set: Map<string, HTMLImageElement>){
		this.name = name;
		this.tileSize = tileSize;
		this.set = set;
	}

	addTileToSet(tileType: string, img: HTMLImageElement) {
		this.set.set(tileType, img);
	}

	get(tileType: string){
		return this.set.get(tileType);
	}
}