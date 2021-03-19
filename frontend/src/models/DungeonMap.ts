import { Size } from "../constants/Size";
import { Configuration } from "./Configuration";
import { Coordinates } from "./Coordinates";
import { CorridorInstance } from "./CorridorInstance";
import { Entrance } from "./Entrance";
import { RegionInstance } from "./RegionInstance";
import { RoomInstance } from "./RoomInstance";

export class DungeonMap {
	private width: number;
	private height: number;
	private map: Map<Coordinates, RegionInstance[]>;
	private config: Configuration;

	constructor(config: Configuration){
		this.config = config;

		// TODO: Chose actual values
		switch(this.config.mapSize){
			case Size.small:
				this.width = this.height = 10;
				break;
			case Size.medium:
				this.width = this.height = 20;
				break;
			case Size.medium:
				this.width = this.height = 30;
		}

		this.map = new Map;
	}

	getSingleImage() {
		// TODO
	}

	getMultiImages() {
		// TODO
	}

	getJSON() {
		// TODO
	}

	addCorridor(corridor: CorridorInstance, locations: Coordinates[]){
		this.addRegion(corridor, locations);
	}

	removeCorridor(corridor: CorridorInstance) {
		this.removeRegion(corridor);
	}

	addRoom(room: RoomInstance, start: Coordinates, locations: Coordinates[]) {
		room.start = start;
		this.addRegion(room, locations);
	}

	removeRoom(room: RoomInstance) {
		this.removeRegion(room);
	}

	moveRoom(room: RoomInstance, newStart: Coordinates){
		var diff = newStart.subtract(room.start);
		if (diff.x != 0 || diff.y != 0){
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

	addEntrance(entrance: Entrance, location:Coordinates){
		if (this.map.has(location)){
			entrance.location = location;
			this.map.get(entrance.location)[0].entrances.push(entrance);
		}
		// TODO: Else throw error ?
	}

	removeEntrance(entrance: Entrance){
		if (this.map.has(entrance.location)){
			this.map.get(entrance.location).forEach((region) => {
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

	// Note, if a location is already occupied then it will not be 
	// changed, which may result is strangely shaped regions. The
	// location will remain in this region though, and if the overlapping
	// region is later removed then this region can be made visible again
	// Also, if a location is out of map bounds then the locations will remain
	// in the region in case it is moved, but won't be added to the map
	private addRegion(region: RegionInstance, locations: Coordinates[]) {
		locations.forEach((location) => {
			region.locations.push(location);
			this.addLocationToMap(region, location);
		});
	}

	private removeRegion(region: RegionInstance) {
		region.locations.forEach((location) => {
			this.removeLocationFromMap(region, location);
		});
	}

	private addLocationToMap(region: RegionInstance, location: Coordinates) {
		if (this.map.has(location)){
			this.map.get(location).push(region);
		}
		else{
			this.map.set(location, [region]);
		}
	}

	private removeLocationFromMap(region: RegionInstance, location: Coordinates){
		if (this.map.has(location)){
			var regions = this.map.get(location);
			var index = regions.indexOf(region);
			if (index > -1){
				if (regions.length == 1){
					this.map.delete(location);
				}
				else{
					regions[index] = regions[regions.length - 1];
					regions.pop();
				}
			}
		}
	}
}