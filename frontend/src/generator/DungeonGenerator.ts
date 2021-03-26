import { CorridorCategory } from './../models/CorridorCategory';
import { RoomShape } from "../constants/RoomShape";
import { Size } from "../constants/Size";
import { Configuration } from "../models/Configuration";
import { Coordinates } from "../models/Coordinates";
import { DungeonMap } from "../models/DungeonMap";
import { Entrance } from "../models/Entrance";
import { RegionCategory } from "../models/RegionCategory";
import { RegionInstance } from "../models/RegionInstance";
import { RoomCategory } from "../models/RoomCategory";
import { RoomInstance } from "../models/RoomInstance";
import { Probabilities } from "./Probabilities";
import { CorridorInstance } from '../models/CorridorInstance';
import { Direction } from '../constants/Direction';
import { CorridorWidth } from '../constants/CorridorWidth';

export class DungeonGenerator {
	// TODO: Chose actual values
	private itemChance: number = 5;
	private trapChance: number = 5;
	private monsterChance: number = 5;
	private defaultSqrtArea = 3;

	generateDungeon(config: Configuration): DungeonMap {
		var map: DungeonMap = new DungeonMap(config);
		var lastPath: Coordinates[] = [];
		var numRooms = 0;
		var start: Coordinates = new Coordinates(0,0);
		start.x = Math.floor(Math.random() * map.getWidth());
		start.y = Math.floor(Math.random() * map.getHeight());
		lastPath.push(start);
		var done = false;

		var turnChance = config.getTurnChance();
		var maxLength = config.getMaxLength();
		var maxRooms = config.getMaxRooms();
		var direction: Direction = Direction.right;
		while(!done){
			if (Math.random() > (maxRooms - numRooms)/maxRooms){
				if (lastPath.length > 0){
					map.addCorridor(this.generateCorridor(config.corridorCategories.randPickOne(), lastPath, direction));
				}
				done = true;
			}
			else{
				var last = lastPath.slice(-1)[0];
				if ( Math.random() < turnChance){
					var directions = this.getNewDirectionProb(map, last, direction);
					direction = directions.randPickOne();
				}

				var next = this.getNextLocation(last, direction);

				if ( Math.random() > (maxLength - lastPath.length)/maxLength){
					var result = this.finishPath(config, map, lastPath, direction);
					next = result[0];
					direction = result[1];
					lastPath = [];
					numRooms ++;
				}
	
				lastPath.push(next);
			}
		}
		return map;
	}

	private finishPath(config: Configuration, map: DungeonMap, lastPath: Coordinates[], direction:Direction): [Coordinates, Direction] {
		map.addCorridor(this.generateCorridor(config.corridorCategories.randPickOne(), lastPath, direction));
		var room = this.generateRoom(config.roomCategories.randPickOne(), next, direction);
		map.addRoom(room);
		var next = Probabilities.buildUniform<Coordinates>(map.getRegionBorder(room)).randPickOne();

		var mid = room.locations[Math.floor(room.locations.length/2)];
		direction = mid.getDirectionTo(next);

		return [next, direction];
	}

	private getNextLocation(last: Coordinates, direction: Direction): Coordinates {
		switch (direction){
			case Direction.right:
				return new Coordinates(last.x + 1, last.y);
			case Direction.left:
				return new Coordinates(last.x - 1, last.y);
			case Direction.up:
				return new Coordinates(last.x, last.y + 1);
			case Direction.down:
				return new Coordinates(last.x, last.y - 1);
		}
	}

	private getNewDirectionProb(map: DungeonMap, currentLocation: Coordinates, currentDir: Direction): Probabilities<Direction> {
		var probs: Map<Direction, number> = new Map<Direction, number>();

		if (currentDir != Direction.left){
			probs.set(Direction.left, currentLocation.x/map.getWidth());
		}

		if (currentDir != Direction.right){
			probs.set(Direction.right, (map.getWidth() - currentLocation.x)/map.getWidth());
		}

		if (currentDir != Direction.down){
			probs.set(Direction.down, currentLocation.y/map.getHeight());
		}

		if (currentDir != Direction.up){
			probs.set(Direction.up, (map.getHeight() - currentLocation.y)/map.getHeight());
		}

		return new Probabilities(probs);
	}

	private addEntrances(map: DungeonMap){
		// TODO: Build this if we want to add entrances when regions intersect not just when room is created from path


		// var category = 
		// var entranceTypes: EntranceType[] = category.entranceTypes.randPickNum(entranceLocations.length);
		// entranceTypes.forEach((entranceType, index) => {
		// 	region.entrances.push(new Entrance(entranceType, entranceLocations[index]));
		// })
	}

	private generateRoom(category: RoomCategory, start: Coordinates, direction: Direction): RoomInstance {
		var room: RoomInstance = this.genearteRegion(category) as RoomInstance;
		room.start = start;
		room.category = category;
		room.size = category.sizes.randPickOne();
		room.shape = category.shapes.randPickOne();
		room.entrances = [new Entrance(category.entranceTypes.randPickOne(), start)];

		var sizeModifier;
		// TODO: Chose actual values
		switch(room.size){
			case Size.small:
				sizeModifier = 1;
				break;
			case Size.medium:
				sizeModifier = 2;
				break;
			case Size.large:
				sizeModifier = 3;
		}
		room.locations = this.getRoomLocations(room.shape, start, sizeModifier, direction);
		return room;
	}

	private generateCorridor(category: CorridorCategory, path: Coordinates[], direction: Direction): CorridorInstance {
		var corridor: CorridorInstance = this.genearteRegion(category) as CorridorInstance;
		corridor.category = category;
		corridor.width = category.widths.randPickOne();

		var widthModifier;
		// TODO: Chose actual values
		switch(corridor.width){
			case CorridorWidth.thin:
				widthModifier = 1;
				break;
			case CorridorWidth.medium:
				widthModifier = 2;
				break;
			case CorridorWidth.wide:
				widthModifier = 3;
		}
		corridor.locations = this.getCorridorLocations(path, direction, widthModifier);
		return corridor;
	}

	private genearteRegion(category: RegionCategory): RegionInstance {
		var region = new RegionInstance();

		// TODO: Do this according to difficulty
		region.tileSet = category.tileSets.randPickOne();
		region.monsters = category.monsters.randPickMany(this.monsterChance);
		region.state = category.states.randPickOne();
		region.items = category.items.randPickMany(this.itemChance);
		region.traps = category.traps.randPickMany(this.trapChance);
		
		return region;
	}

	private getRoomLocations(shape: RoomShape, start: Coordinates, sizeModifier: number, direction: Direction): Coordinates[]{
		var roomWidth: number;
		var roomHeight: number;
		var cutCorners: boolean = false;
		switch(shape){
			case (RoomShape.square):
				roomWidth = roomHeight = this.defaultSqrtArea;
				break;
			case (RoomShape.rectangle):
				if (Math.random() > 0.5){
					roomWidth = Math.max(1, Math.floor(Math.random()*this.defaultSqrtArea));
					roomHeight = Math.ceil((this.defaultSqrtArea*this.defaultSqrtArea)/roomWidth);
				}
				else{
					roomHeight = Math.max(1, Math.floor(Math.random()*this.defaultSqrtArea));
					roomWidth = Math.ceil((this.defaultSqrtArea*this.defaultSqrtArea)/roomHeight);
				}
				break;
			case (RoomShape.nonRectangular):
				roomWidth = roomHeight = this.defaultSqrtArea;
				cutCorners = true;
				break;
		}
		roomWidth *= sizeModifier;
		roomHeight *= sizeModifier;
		var locations: Coordinates[] = [];

		var radius = roomWidth/2;
		var offsets = this.findRoomOffsets(roomWidth, roomHeight, direction, cutCorners, radius);
		var iOffset = offsets[0];
		var jOffset = offsets[1];

		for (var i = iOffset; i < roomWidth + iOffset; i++){
			for (var j = jOffset; j < roomHeight + jOffset; j++){
				if (!cutCorners || ((i - iOffset)*(i - iOffset) + (j - jOffset)*(j - jOffset) <= (radius)*(radius))){
					locations.push(new Coordinates(start.x + i, start.y + j));
				}
			}
		}
		return locations;
	}

	private findRoomOffsets(roomWidth: number, roomHeight: number, direction: Direction, cutCorners: boolean, radius: number): number[] {
		var iOffset = 0;
		var jOffset = 0;
		if (direction == Direction.up || direction == Direction.down) {
			iOffset = -(Math.floor(Math.random() * roomWidth));
			if (direction == Direction.down){
				jOffset = -roomHeight;
			}
		}
		if (direction == Direction.right || direction == Direction.left) {
			jOffset = -(Math.floor(Math.random() * roomHeight));
			if (direction == Direction.left){
				iOffset = -roomWidth;
			}
		}

		if (cutCorners)
		{
			var sqrDistance = (iOffset)*(iOffset) + (jOffset)*(jOffset);
			if (sqrDistance > (radius)*(radius)){
				var diff = Math.sqrt(sqrDistance) - radius;
				switch(direction){
					case Direction.down:
						jOffset += diff;
						break;
					case Direction.up:
						jOffset -= diff;
						break;
					case Direction.left:
						iOffset += diff;
						break;
					case Direction.right:
						iOffset -= diff;
				}
			}
		}

		return [iOffset, jOffset];
	}

	private getCorridorLocations(path: Coordinates[], lastDirection: Direction, widthModifier: number): Coordinates[] {
		var locations: Set<Coordinates> = new Set<Coordinates>();
		var start = Math.floor(widthModifier/2);
		for(var i = 0; i < path.length; i++){
			var current = path[i];
			var direction = lastDirection;
			if (i < path.length - 1){
				direction = current.getDirectionTo(path[i + 1]);
			}

			if (direction == Direction.up || direction == Direction.down) {
				for(var j = 0 - start; j < widthModifier - start; j++){
					locations.add(new Coordinates(current.x + j, current.y));
				}
			}
			else if (direction == Direction.right || direction == Direction.left) {
				for(var j = 0 - start; j < widthModifier - start; j++){
					locations.add(new Coordinates(current.x, current.y + j));
				}
			}
		}

		return Array.from(locations);
	}

}