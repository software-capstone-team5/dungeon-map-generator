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
import { MonsterState } from '../constants/MonsterState';

export class DungeonGenerator {
	// TODO: Chose actual values
	private static itemChance: number = 5;
	private static trapChance: number = 5;
	private static monsterChance: number = 5;
	private static defaultSqrtArea = 3;

	static generateDungeon(config: Configuration): DungeonMap {
		var map: DungeonMap = new DungeonMap(config);
		var lastPath: Coordinates[] = [];
		var numRooms = 0;
		var start: Coordinates = new Coordinates(0,0);
		start.x = Math.floor(Math.random() * map.getWidth());
		// start.x = 0;
		start.y = Math.floor(Math.random() * map.getHeight());
		lastPath.push(start);
		var done = false;

		var turnChance = config.getTurnChance();
		var maxLength = config.getMaxLength();
		var maxRooms = config.getMaxRooms();
		var minRooms = config.getMinRooms();
		var direction: Direction = Direction.right;
		var lastEntranceDirection: Direction = Direction.left;

		while(!done){
			if (numRooms > minRooms && Math.random() > (maxRooms - numRooms)/maxRooms){
				if (lastPath.length > 0){
					map.addCorridor(this.generateCorridor(config.corridorCategories.randPickOne(), config.defaultCorridorCategory, lastPath, direction, lastEntranceDirection));
				}
				done = true;
			}
			else{
				var last = lastPath.slice(-1)[0];

				if (last.x <= 0 || last.x >= map.getWidth() || last.y <= 0 || last.y >= map.getHeight() || Math.random() < turnChance){
					var directions = this.getNewDirectionProb(map, last, direction);
					direction = directions.randPickOne()!;
				}

				var next = map.constrainToMap(this.getNextLocation(last, direction));

				var region = map.getRegionInstance(next.x, next.y);
				if(region){
					if (lastPath && lastPath.length > 0){
						// this.addEntrance(region, config, next, direction);
						var corridor = this.generateCorridor(config.corridorCategories.randPickOne(), config.defaultCorridorCategory, lastPath, direction, lastEntranceDirection);	
						map.addCorridor(corridor);
					}
					var result = this.branchFromMap(map, direction);
					next = result[0];
					direction = result[1];
					lastPath = [];
					lastEntranceDirection = this.getOppositeDirection(direction);
					region = map.getRegionInstance(next.x, next.y);
				}

				next = map.constrainToMap(next);

				if ( Math.random() > (maxLength - lastPath.length)/maxLength){
					var corridor = this.generateCorridor(config.corridorCategories.randPickOne(), config.defaultCorridorCategory, lastPath, direction, lastEntranceDirection);
					map.addCorridor(corridor);
					var room = this.generateRoom(config.roomCategories.randPickOne(), config.defaultRoomCategory, next, direction);
					map.addRoom(room);

					var result = this.branchFromRegion(room, map, direction);
					if (result[0]) {
						next = result[0];
						direction = result[1];
						numRooms ++;
						// this.addEntrance(room, config, next, direction);
						next = map.constrainToMap(this.getNextLocation(last, direction));
					}
					else{
						map.removeRoom(room);
					}
					lastPath = [];
					lastEntranceDirection = this.getOppositeDirection(direction);
				}

	
				lastPath.push(next);
			}
		}
		return map;
	}	

	private static addEntrance(region: RegionInstance, config: Configuration, location: Coordinates, direction: Direction){
		var category;
		var defaultCategory;
		if (region.isCorridor){
			category = (region as CorridorInstance).category;
			defaultCategory = config.defaultCorridorCategory;
		}
		else{
			category = (region as RoomInstance).category;
			defaultCategory = config.defaultRoomCategory;
		}
		region.entrances.push(new Entrance(category.entranceTypes ? category.entranceTypes!.randPickOne()! : defaultCategory.entranceTypes!.randPickOne()!, location, direction));
	}

	private static branchFromRegion(region: RegionInstance, map: DungeonMap, direction:Direction): [Coordinates, Direction]{
		var next = Probabilities.buildUniform<Coordinates>(map.getRegionBorder(region)).randPickOne()!;
		
		if (next) {
			var midIndex = Math.floor(region.locations.length/2);
			var mid = region.locations[midIndex];
			direction = mid.getDirectionTo(next);
		}

		return [next, direction];
	}

	private static branchFromMap(map: DungeonMap, direction:Direction): [Coordinates, Direction]{
		var next = Probabilities.buildUniform<Coordinates>(map.getMapBorder()).randPickOne()!;
		
		var adjacent = [new Coordinates(next.x + 1, next.y),
			new Coordinates(next.x - 1, next.y),
			new Coordinates(next.x, next.y + 1),
			new Coordinates(next.x, next.y - 1)];
		for (var i = 0; i < adjacent.length; i++){
			var point = adjacent[i];
			if (!map.getRegionInstance(point.x, point.y)){
				direction = next.getDirectionTo(point);
				break;
			}
		}

		return [next, direction];
	}

	private static getNextLocation(last: Coordinates, direction: Direction): Coordinates {
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

	private static getOppositeDirection(direction: Direction): Direction {
		switch (direction){
			case Direction.right:
				return Direction.left;
			case Direction.left:
				return Direction.right;
			case Direction.up:
				return Direction.down;
			case Direction.down:
				return Direction.up;
		}
	}

	private static getNewDirectionProb(map: DungeonMap, currentLocation: Coordinates, currentDir: Direction): Probabilities<Direction> {
		var probs: Map<Direction, number> = new Map<Direction, number>();

		if (currentDir !== Direction.left && currentDir !== Direction.right){
			probs.set(Direction.left, currentLocation.x < map.getWidth()/4 ? currentLocation.x/map.getWidth() : 0.5);
			probs.set(Direction.right, (map.getWidth() - currentLocation.x) < map.getWidth()/4 ? (map.getWidth() - currentLocation.x)/map.getWidth() : 0.5);
		}

		if (currentDir !== Direction.down && currentDir !== Direction.up){
			probs.set(Direction.down, currentLocation.y < map.getHeight()/4 ? currentLocation.y/map.getHeight() : 0.5);
			probs.set(Direction.up, (map.getHeight() - currentLocation.y) < map.getHeight()/4 ? (map.getHeight() - currentLocation.y)/map.getHeight() : 0.5);
		}

		return new Probabilities(probs);
	}

	private static addEntrances(map: DungeonMap){
		// TODO: Build this if we want to add entrances when regions intersect not just when room is created from path


		// var category = 
		// var entranceTypes: EntranceType[] = category.entranceTypes.randPickNum(entranceLocations.length);
		// entranceTypes.forEach((entranceType, index) => {
		// 	region.entrances.push(new Entrance(entranceType, entranceLocations[index]));
		// })
	}

	private static generateRoom(category: RoomCategory | null, defaultCategory: RoomCategory, start: Coordinates, direction: Direction): RoomInstance {
		if (!category){
			category = defaultCategory;
		}

		var room: RoomInstance = this.genearteRegion(category, defaultCategory) as RoomInstance;
		room.start = start;
		room.category = category;
		room.size = category.sizes ? category.sizes!.randPickOne()! : defaultCategory.sizes!.randPickOne()!;
		room.shape = category.shapes ? category.shapes!.randPickOne()! : defaultCategory.shapes!.randPickOne()!;
		// room.entrances = [new Entrance(category.entranceTypes ? category.entranceTypes!.randPickOne()! : defaultCategory.entranceTypes!.randPickOne()!, start, this.getOppositeDirection(direction))];

		var sizeModifier;
		// TODO: Chose actual values
		switch(room.size){
			case Size.small:
				sizeModifier = 1;
				break;
			case Size.medium:
				sizeModifier = 1.5;
				break;
			case Size.large:
				sizeModifier = 2;
		}
		room.locations = this.getRoomLocations(room.shape, start, sizeModifier, direction);
		return room;
	}

	private static generateCorridor(category: CorridorCategory | null, defaultCategory: CorridorCategory, path: Coordinates[], direction: Direction, lastEntranceDirection: Direction): CorridorInstance {
		if (!category){
			category = defaultCategory;
		}
		
		var corridor: CorridorInstance = this.genearteRegion(category, defaultCategory) as CorridorInstance;
		corridor.category = category;
		corridor.width = category.widths ? category.widths!.randPickOne()! : defaultCategory.widths!.randPickOne()!;
		// corridor.entrances = [
			// new Entrance(category.entranceTypes ? category.entranceTypes!.randPickOne()! : defaultCategory.entranceTypes!.randPickOne()!, path[path.length - 1], direction)]
			// new Entrance(category.entranceTypes ? category.entranceTypes!.randPickOne()! : defaultCategory.entranceTypes!.randPickOne()!, path[0], lastEntranceDirection)];

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

	private static genearteRegion(category: RegionCategory, defaultCategory: RegionCategory): RegionInstance {
		var region = new RegionInstance();

		// TODO: Do this according to difficulty
		region.tileSet = category.tileSets ? category.tileSets.randPickOne()! : defaultCategory.tileSets!.randPickOne()!;
		region.monsters = category.monsters ? category.monsters.randPickMany(this.monsterChance) : defaultCategory.monsters!.randPickMany(this.monsterChance);
		region.state = category.states ? category.states.randPickOne()! : defaultCategory.states!.randPickOne() ?? MonsterState.relaxed;
		region.items = category.items ? category.items.randPickMany(this.itemChance) : defaultCategory.items!.randPickMany(this.itemChance);
		region.traps = category.traps ? category.traps.randPickMany(this.trapChance) : defaultCategory.traps!.randPickMany(this.trapChance);
		
		return region;
	}

	private static getRoomLocations(shape: RoomShape, start: Coordinates, sizeModifier: number, direction: Direction): Coordinates[]{
		var roomWidth: number;
		var roomHeight: number;
		var cutCorners: boolean = false;
		var sqrArea: number = Math.random()*this.defaultSqrtArea;
		switch(shape){
			case (RoomShape.square):
				roomWidth = roomHeight = Math.ceil(this.defaultSqrtArea);
				break;
			case (RoomShape.rectangle):
				if (Math.random() > 0.5){
					roomWidth = Math.max(1, Math.floor(Math.random() * sqrArea));
					roomHeight = Math.ceil((sqrArea*sqrArea)/roomWidth);
				}
				else{
					roomHeight = Math.max(1, Math.floor(Math.random()*sqrArea));
					roomWidth = Math.ceil(sqrArea*sqrArea/roomHeight);
				}
				break;
			case (RoomShape.nonRectangular):
				roomWidth = roomHeight = sqrArea;
				cutCorners = true;
				break;
		}
		roomWidth = Math.floor(roomWidth*sizeModifier);
		roomHeight = Math.floor(roomHeight*sizeModifier);
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

	private static findRoomOffsets(roomWidth: number, roomHeight: number, direction: Direction, cutCorners: boolean, radius: number): number[] {
		var iOffset = 0;
		var jOffset = 0;
		if (direction === Direction.up || direction === Direction.down) {
			iOffset = -(Math.floor(Math.random() * roomWidth));
			if (direction === Direction.down){
				jOffset = -roomHeight;
			}
		}
		if (direction === Direction.right || direction === Direction.left) {
			jOffset = -(Math.floor(Math.random() * roomHeight));
			if (direction === Direction.left){
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

		return [Math.floor(iOffset), Math.floor(jOffset)];
	}

	private static getCorridorLocations(path: Coordinates[], lastDirection: Direction, widthModifier: number): Coordinates[] {
		var locations: Set<Coordinates> = new Set<Coordinates>();
		var start = Math.floor(widthModifier/2);
		for(var i = 0; i < path.length; i++){
			var current = path[i];
			var direction = lastDirection;
			if (i < path.length - 1){
				direction = current.getDirectionTo(path[i + 1]);
			}

			var j;
			if (direction === Direction.up || direction === Direction.down) {
				for(j = 0 - start; j < widthModifier - start; j++){
					locations.add(new Coordinates(current.x + j, current.y));
				}
			}
			else if (direction === Direction.right || direction === Direction.left) {
				for(j = 0 - start; j < widthModifier - start; j++){
					locations.add(new Coordinates(current.x, current.y + j));
				}
			}
		}

		return Array.from(locations);
	}

}