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
		// start.x = Math.floor(Math.random() * map.getWidth());
		start.x = 0;
		start.y = Math.floor(Math.random() * map.getHeight());
		lastPath.push(start);
		var done = false;

		var turnChance = config.getTurnChance();
		var maxLength = config.getMaxLength();
		var maxRooms = config.getMaxRooms();
		var minRooms = config.getMinRooms();
		var direction: Direction = Direction.right;

		while(!done){
			if (numRooms > minRooms && Math.random() > (maxRooms - numRooms)/maxRooms){
				if (lastPath.length > 0){
					map.addCorridor(this.generateCorridor(config.corridorCategories.randPickOne(), config.defaultCorridorCategory, lastPath, direction));
				}
				done = true;
			}
			else{
				var last = lastPath.slice(-1)[0];

				if (last.x <= 0 || last.x >= map.getWidth() || last.y <= 0 || last.y >= map.getHeight() || Math.random() < turnChance){
					var directions = this.getNewDirectionProb(map, last, direction);
					direction = directions.randPickOne()!;
				}

				var next = this.getNextLocation(last, direction);
				next = this.constrainToMap(next, map.getWidth(), map.getHeight());

				var region = map.getRegionInstance(next.x, next.y);
				if (region) {
					map.addCorridor(this.generateCorridor(config.corridorCategories.randPickOne(), config.defaultCorridorCategory, lastPath, direction));
					var result = this.branchFromRegion(region, map, direction);
					next = result[0];
					direction = result[1];
					lastPath = [];
				}

				if ( Math.random() > (maxLength - lastPath.length)/maxLength){
					map.addCorridor(this.generateCorridor(config.corridorCategories.randPickOne(), config.defaultCorridorCategory, lastPath, direction));
					var room = this.generateRoom(config.roomCategories.randPickOne(), config.defaultRoomCategory, next, direction);
					map.addRoom(room);
					var result = this.branchFromRegion(room, map, direction);
					if (result[0]) {
						next = result[0];
						direction = result[1];
						numRooms ++;
					}
					else{
						map.removeRoom(room);
					}
					lastPath = [];
				}

				next = this.constrainToMap(next, map.getWidth(), map.getHeight());
	
				lastPath.push(next);
			}
		}
		return map;
	}

	private static constrainToMap(location: Coordinates, maxX: number, maxY: number): Coordinates{
		var next = new Coordinates(location.x, location.y);
		if (next.x < 0){
			next.x = 0;
		}
		if (next.x > maxX){
			next.x = maxX;
		}
		if (next.y < 0){
			next.y = 0;
		}
		if (next.y > maxY){
			next.y = maxY;
		}

		return next;
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

	private static getNextLocation(last: Coordinates, direction: Direction): Coordinates {
		// TODO: Constrain to map size
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
		room.entrances = [new Entrance(category.entranceTypes ? category.entranceTypes!.randPickOne()! : defaultCategory.entranceTypes!.randPickOne()!, start)];

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

	private static generateCorridor(category: CorridorCategory | null, defaultCategory: CorridorCategory, path: Coordinates[], direction: Direction): CorridorInstance {
		if (!category){
			category = defaultCategory;
		}
		
		var corridor: CorridorInstance = this.genearteRegion(category, defaultCategory) as CorridorInstance;
		corridor.category = category;
		corridor.width = category.widths ? category.widths!.randPickOne()! : defaultCategory.widths!.randPickOne()!;

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