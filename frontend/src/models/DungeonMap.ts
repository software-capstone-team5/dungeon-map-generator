import { Configuration } from "./Configuration";
import { Coordinates } from "./Coordinates";
import { CorridorInstance } from "./CorridorInstance";
import { Entrance } from "./Entrance";
import { RegionInstance } from "./RegionInstance";
import { RoomInstance } from "./RoomInstance";

export class DungeonMap {
	private width: number;
	private height: number;
	private map: Map<string, RegionInstance[]>;
	private config: Configuration;
	corridors: CorridorInstance[] = [];
	rooms: RoomInstance[] = [];
	tileSize: number = 48;

	// possible alternative to current map is to map corridates to key 
	// which maps to region instance. Avoids large map with duplicate instances

	constructor(config: Configuration){
		this.config = config;

		this.width = this.height = this.config.getMapSizeNum();

		this.map = new Map();
	}

	getWidth() {
		return this.width;
	}

	getHeight() {
		return this.height;
	}

	getRegionInstance(x: number, y: number): RegionInstance | null{
		var locationKey = new Coordinates(x, y).toString();
		if (this.map.has(locationKey)){
			return this.map.get(locationKey)![0]
		}
		
		return null;
	}

	getSingleImage() {
		// TODO
	}

	getMultiImages() {
		// TODO
	}

	getJSON(): string {
		// TODO: Consider condensing this file and reducing redundancy.
		return JSON.stringify(this);
	}

	addCorridor(corridor: CorridorInstance){
		corridor.isCorridor = true;
		this.corridors.push(corridor);
		this.addRegion(corridor);
	}

	removeCorridor(corridor: CorridorInstance) {
		this.removeRegion(corridor);
		this.removeFromArray(this.corridors, corridor);
	}

	addRoom(room: RoomInstance) {
		room.isCorridor = false;
		this.rooms.push(room);
		this.addRegion(room);
		return room;
	}

	removeRoom(room: RoomInstance) {
		this.removeRegion(room);
		this.removeFromArray(this.rooms, room);
	}

	moveRoom(room: RoomInstance, newStart: Coordinates){
		var diff = newStart.subtract(room.start);
		if (diff.x !== 0 || diff.y !== 0){
			room.locations.forEach((location) => {
				this.removeLocationFromMap(room, location);
				location = location.add(diff); // TODO: Confirm this modifies location in room
				this.addLocationToMap(room, location);
			});

			room.entrances.forEach((entrance) => {
				entrance.location = entrance.location.add(diff); // TODO: Confirm this modifies location in entrance
			});
		}
		room.start = newStart;
	}

	addEntrance(entrance: Entrance){
		var locationKey = entrance.location.toString();
		if (this.map.has(locationKey)){
			this.map.get(locationKey)![0].entrances.push(entrance);
		}
		// TODO: Else throw error ?
	}

	removeEntrance(entrance: Entrance){
		var locationKey = entrance.location.toString();
		if (this.map.has(locationKey)){
			this.map.get(locationKey)!.forEach((region) => {
				var index = region.entrances.indexOf(entrance);
				if (index > -1){
					if (region.entrances.length > 1){
						region.entrances[index] = region.entrances[region.entrances.length - 1];
					}
					region.entrances.pop();
				}
			})
		}
	}

	getRegionBorder(region: RegionInstance): Coordinates[] {
		var border: Coordinates[] = [];
		region.locations.forEach((location) => {
			var locationKey = location.toString();
			if (this.map.has(locationKey) && this.map.get(locationKey)![0] === region){
				var adjacent = [new Coordinates(location.x + 1, location.y),
								new Coordinates(location.x - 1, location.y),
								new Coordinates(location.x, location.y + 1),
								new Coordinates(location.x, location.y - 1)];
				for (var i = 0; i < adjacent.length; i++){
					var point = adjacent[i];
					var pointKey = point.toString();
					if (!this.map.has(pointKey) || this.map.get(pointKey)![0] !== region){
						border.push(location);
						break;
					}
				}
			}
		})
		return border;
	}

	getMapBorder(): Coordinates[] {
		var border: Coordinates[] = [];
		this.map.forEach((value, key) => {
			var location: Coordinates = Coordinates.fromString(key);
			var adjacent = [new Coordinates(location.x + 1, location.y),
				new Coordinates(location.x - 1, location.y),
				new Coordinates(location.x, location.y + 1),
				new Coordinates(location.x, location.y - 1)];
			for (var i = 0; i < adjacent.length; i++){
				var point = adjacent[i];
				var pointKey = point.toString();
				if (!this.map.has(pointKey)){
					border.push(location);
					break;
				}
			}
		})
		return border;
	}

	isOutOfBounds(x: number, y: number): boolean {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height){
			return true;
		}
		return false;
	}

	constrainToMap(location: Coordinates): Coordinates{
		var next = new Coordinates(location.x, location.y);
		if (next.x < 0){
			next.x = 0;
		}
		if (next.x > this.width){
			next.x =  this.width;
		}
		if (next.y < 0){
			next.y = 0;
		}
		if (next.y > this.height){
			next.y = this.height;
		}

		return next;
	}

	// Note, if a location is already occupied then it will not be 
	// changed, which may result is strangely shaped regions. The
	// location will remain in this region though, and if the overlapping
	// region is later removed then this region can be made visible again
	// Also, if a location is out of map bounds then the locations will remain
	// in the region in case it is moved, but won't be added to the map
	private addRegion(region: RegionInstance) {
		region.locations.forEach((location) => {
			this.addLocationToMap(region, location);
		});
	}

	private removeRegion(region: RegionInstance) {
		region.locations.forEach((location) => {
			this.removeLocationFromMap(region, location);
		});
	}

	private addLocationToMap(region: RegionInstance, location: Coordinates) {
		var locationKey = location.toString();
		if (this.map.has(locationKey)){
			// TODO: Decide if this should be ordered. Should rooms always get priority over corridors?
			this.map.get(locationKey)!.push(region); 
		}
		else{
			this.map.set(locationKey, [region]);
		}
	}

	private removeLocationFromMap(region: RegionInstance, location: Coordinates){
		var locationKey = location.toString();
		if (this.map.has(locationKey)){
			var regions = this.map.get(locationKey)!;
			var index = regions.indexOf(region);
			if (index > -1){
				if (regions.length === 1){
					this.map.delete(locationKey);
				}
				else{
					regions[index] = regions[regions.length - 1];
					regions.pop();
				}
			}
		}
	}

	private removeFromArray<T>(array: T[], item: T){
		var index = array.indexOf(item);
		if (index > -1){
			if (array.length === 1){
				array[index] = array[array.length - 1];
			}
			array.pop();
		}
	}
}