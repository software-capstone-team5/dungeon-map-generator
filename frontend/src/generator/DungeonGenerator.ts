import { CorridorCategory } from './../models/CorridorCategory';
import { RoomShape } from "../constants/RoomShape";
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
import { MonsterState } from '../constants/MonsterState';
import { EntranceType } from '../constants/EntranceType';
import { Monster } from '../models/Monster';
import { Trap } from '../models/Trap';
import { Item } from '../models/Item';

export class DungeonGenerator {
	// TODO: Chose actual values
	private static itemChance: number = 5;
	private static trapChance: number = 5;
	private static monsterChance: number = 5;
	private static defaultSqrtArea = 3;
	private static additionalExitProb = 0.5;
	private static startRoomChance = 1;

	static generateDungeon(config: Configuration): DungeonMap {
		var map: DungeonMap = new DungeonMap(config);
		var lastPath: Coordinates[] = [];
		var numRooms = 0;
		var start: Coordinates = new Coordinates(0,0);
		start.x = Math.floor(Math.min(Math.max(Math.random() * map.getWidth(), map.getWidth() - map.getWidth()/4), map.getWidth()/4));
		start.y = Math.floor(Math.min(Math.max(Math.random() * map.getHeight(), map.getHeight() - map.getHeight()/4), map.getHeight()/4));
		lastPath.push(start);
		var done = false;

		var turnChance = config.getTurnChance();
		var maxLength = config.getMaxLength();
		var maxRooms = config.getMaxRooms();
		var minRooms = config.getMinRooms();
		var direction: Direction = Direction.right;
		var lastEntrance: Entrance = {
			direction: Direction.right,
		} as Entrance
		var lastRegion: RegionInstance | null = null;
		var forceMapBranch: boolean = false;

		if (Math.random() < this.startRoomChance){
			var room = this.generateRoom(config.roomCategories.randPickOne(), config.defaultRoomCategory, start, direction);
			if (room.locations && room.locations && room.locations.length > 1){
				map.addRoom(room);
				var result = this.branchFromRegion(room, map);
				var next = result[0];
				if (next) {
					if (result[1]) {
						direction = result[1];
					}
					numRooms ++;
					lastPath = [next];
	
					var dirToNeighbor = this.getDirectionToNeighbor(next, map, room)!;
					var neighborPoint = next.getNextLocation(dirToNeighbor);
					lastEntrance = this.generateEntrance(room, config, neighborPoint, Direction.getOppositeDirection(dirToNeighbor));
					lastRegion = room;
				}
				else{
					map.removeRoom(room);
				}
			}
		}
		// TODO: Add option to start from room instead of corridor. Just set lastRegion and lastEntrance acordingly

		while(!done){
			// Chance to be done increases as room number increases.
			if (numRooms > minRooms && Math.random() > (maxRooms - numRooms)/maxRooms){
				// chance to add a corridor to a second exterior exit
				if (lastPath.length > 0 && Math.random() < this.additionalExitProb){
					// map.addCorridor(this.generateCorridor(config.corridorCategories.randPickOne(), config.defaultCorridorCategory, lastPath, direction, Direction.getOppositeDirection(lastEntrance.direction), null, lastEntrance.type));
				}
				done = true;
			}
			else{
				var last = lastPath.slice(-1)[0];

				// turn
				if (last.x <= 0 || last.x >= map.getWidth() || last.y <= 0 || last.y >= map.getHeight() || Math.random() < turnChance){
					var directions = this.getNewDirectionProb(map, lastPath, direction);
					direction = directions.randPickOne()!;
				}

				var next = last.getNextLocation(direction);

				// Don't path into existing regions
				var region = map.getRegionInstance(next.x, next.y);
				if(forceMapBranch || region || map.isOutOfBounds(next.x, next.y)){
					forceMapBranch = false;
					// Add the last path to map if applicable // Ended up adding too many corridors
					// if (lastPath && lastPath.length > 0){
					// 	var endEntranceType = null;
					// 	if (region){
					// 		lastEntrance = this.generateEntrance(region, config, next, Direction.getOppositeDirection(direction));
					// 		lastRegion = region;
					// 	}
					// 	var corridor = this.generateCorridor(config.corridorCategories.randPickOne(), config.defaultCorridorCategory, lastPath, direction, Direction.getOppositeDirection(lastEntrance.direction), endEntranceType, lastEntrance.type);	
					// 	map.addCorridor(corridor);
					// 	if (lastRegion){
					// 		lastRegion.entrances.push(lastEntrance);
					// 	}
					// }
					// Pick a border on a region and start path there
					var result = this.branchFromMap(map);
					if (result[0]){
						if (result[1]) {
							direction = result[1];
						}
						next = result[0];
						lastPath = [];

						var dirToNeighbor = this.getDirectionToNeighbor(next, map)!;
						var neightborPoint = next.getNextLocation(dirToNeighbor);
						var neighbor = map.getRegionInstance(neightborPoint.x, neightborPoint.y)!;
						lastEntrance = this.generateEntrance(neighbor, config, neightborPoint, Direction.getOppositeDirection(dirToNeighbor));
						lastRegion = neighbor;
					}
				}

				// Chance to finish corridor and add room increases as length of corridor increases
				if ( Math.random() > (maxLength - lastPath.length)/maxLength){
					var room = this.generateRoom(config.roomCategories.randPickOne(), config.defaultRoomCategory, next, direction);
					if (room.locations && room.locations && room.locations.length > 1){
						map.addRoom(room);
						var result = this.branchFromRegion(room, map);

						if (result[0]) {
							var corridor = this.generateCorridor(config.corridorCategories.randPickOne(), config.defaultCorridorCategory, lastPath, direction, Direction.getOppositeDirection(lastEntrance.direction), room.entrances[0].type, lastEntrance.type);
							map.addCorridor(corridor);
							if (lastRegion && lastEntrance){
								lastRegion.entrances.push(lastEntrance);
							}
							if (result[1]) {
								direction = result[1];
							}
							next = result[0];
							numRooms ++;
							lastPath = [];

							var dirToNeighbor = this.getDirectionToNeighbor(next, map, room)!;
							var neighborPoint = next.getNextLocation(dirToNeighbor);
							lastEntrance = this.generateEntrance(room, config, neighborPoint, Direction.getOppositeDirection(dirToNeighbor));
							lastRegion = room;
						}
						else{
							map.removeRoom(room);
							forceMapBranch = true;
						}
					}
					else{
						forceMapBranch = true;
					}
				}
	
				lastPath.push(next);
			}
		}
		this.generateEncounters(map, config);
		return map;
	}

	private static generateEntrance(region: RegionInstance, config: Configuration, location: Coordinates, direction: Direction, goalType: EntranceType | null = null): Entrance{
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
		var entranceType;
		if (goalType && category.entranceTypes && category.entranceTypes.toMap().has(goalType)){
			entranceType = goalType;
		}
		else{
			entranceType = category.entranceTypes ? category.entranceTypes!.randPickOne()! : defaultCategory.entranceTypes!.randPickOne()!;
		}
		return new Entrance(entranceType, location, direction);
	}

	private static branchFromRegion(region: RegionInstance, map: DungeonMap): [Coordinates, Direction | null]{
		var next = Probabilities.buildUniform<Coordinates>(map.getRegionBorder(region, true)).randPickOne()!;
		
		var direction = this.getAvailableDirection(next, map);
		
		return [next, direction];
	}

	private static branchFromMap(map: DungeonMap): [Coordinates, Direction | null]{
		var next = Probabilities.buildUniform<Coordinates>(map.getMapBorder(true)).randPickOne()!;
		var direction = this.getAvailableDirection(next, map);

		return [next, direction];
	}

	private static getAvailableDirection(point: Coordinates, map: DungeonMap): Direction | null {
		if (point){
			var adjacent = point.getAdjacent();
			for (var i = 0; i < adjacent.length; i++){
				var next = adjacent[i];
				if (!map.getRegionInstance(next.x, next.y) && !map.isOutOfBounds(next.x, next.y)){
					return point.getDirectionTo(next);
				}
			}
		}
		return null;
	}

	private static getDirectionToNeighbor(point: Coordinates, map: DungeonMap, neighbor: RegionInstance | null = null): Direction | null{
		if (point){
			var adjacent = point.getAdjacent();
			for (var i = 0; i < adjacent.length; i++){
				var next = adjacent[i];
				var region =  map.getRegionInstance(next.x, next.y);
				if (region && (!neighbor || region === neighbor)){
					return point.getDirectionTo(next);
				}
			}
		}
		return null;
	}

	private static getNewDirectionProb(map: DungeonMap, currentPath: Coordinates[], currentDir: Direction): Probabilities<Direction> {
		var probs: Map<Direction, number> = new Map<Direction, number>();
		var length = currentPath.length;
		var currentLocation = currentPath[length - 1];
		var pastLocation;
		if (length >= 3) {
			pastLocation = currentPath[length - 1];
		}
		var adjacentLeft = pastLocation && pastLocation.x === currentLocation.x - 1;
		var adjacentRight = pastLocation && pastLocation.x === currentLocation.x + 1;
		var adjacentDown = pastLocation && pastLocation.y === currentLocation.y - 1;
		var adjacentUp = pastLocation && pastLocation.y === currentLocation.y + 1;
		if (currentDir === Direction.up || currentDir === Direction.down){
			if (!((adjacentUp || adjacentDown) && adjacentLeft)){
				probs.set(Direction.left, currentLocation.x < map.getWidth()/4 ? currentLocation.x/map.getWidth() : 0.5);
			}
			if (!((adjacentUp || adjacentDown) && adjacentRight)){
				probs.set(Direction.right, (map.getWidth() - currentLocation.x) < map.getWidth()/4 ? (map.getWidth() - currentLocation.x)/map.getWidth() : 0.5);
			}
		}
		else {
			if (!((adjacentRight || adjacentLeft) && adjacentDown)){
				probs.set(Direction.down, currentLocation.y < map.getHeight()/4 ? currentLocation.y/map.getHeight() : 0.5);
			}
			if (!((adjacentRight || adjacentLeft) && adjacentUp)){
				probs.set(Direction.up, (map.getHeight() - currentLocation.y) < map.getHeight()/4 ? (map.getHeight() - currentLocation.y)/map.getHeight() : 0.5);
			}
		}
		if (probs.keys.length === 0){
			probs.set(currentDir, 1);
		}

		return new Probabilities(probs);
	}

	private static generateRoom(category: RoomCategory | null, defaultCategory: RoomCategory, start: Coordinates, direction: Direction): RoomInstance {
		if (!category){
			category = defaultCategory;
		}

		var room: RoomInstance = new RoomInstance();
		room.start = start;
		room.category = category;
		room.tileSet = category.tileSets ? category.tileSets.randPickOne()! : defaultCategory.tileSets!.randPickOne()!;
		room.size = category.sizes ? category.sizes!.randPickOne()! : defaultCategory.sizes!.randPickOne()!;
		room.shape = category.shapes ? category.shapes!.randPickOne()! : defaultCategory.shapes!.randPickOne()!;
		room.entrances = [new Entrance(category.entranceTypes ? category.entranceTypes!.randPickOne()! : defaultCategory.entranceTypes!.randPickOne()!, start, Direction.getOppositeDirection(direction))];

		var sizeModifier = room.getRoomSizeModifier();
		room.locations = this.getRoomLocations(room.shape, start, sizeModifier, direction);
		return room;
	}

	private static generateCorridor(category: CorridorCategory | null, defaultCategory: CorridorCategory, path: Coordinates[], 
		endDirection: Direction, startDirection: Direction, endEntranceType: EntranceType | null, startEntranceType: EntranceType | null, 
		addEndingEntrance: boolean = true): CorridorInstance {
		if (!category){
			category = defaultCategory;
		}
		
		var corridor: CorridorInstance = new CorridorInstance();
		corridor.category = category;
		corridor.width = category.widths ? category.widths!.randPickOne()! : defaultCategory.widths!.randPickOne()!;
		corridor.tileSet = category.tileSets ? category.tileSets.randPickOne()! : defaultCategory.tileSets!.randPickOne()!;
		
		var startingEntranceType = this.tryMatchEntrances(category, defaultCategory, startEntranceType);
		var endingEntranceType = this.tryMatchEntrances(category, defaultCategory, endEntranceType);
		corridor.entrances = [new Entrance(startingEntranceType, path[0], startDirection)];
		if (addEndingEntrance){
			corridor.entrances.push(new Entrance(endingEntranceType, path[path.length - 1], endDirection));
		}

		var widthModifier = corridor.getWidthModifier();
		corridor.locations = this.getCorridorLocations(path, endDirection, widthModifier);
		return corridor;
	}

	private static generateEncounters(map: DungeonMap, config: Configuration){
		var regionsWithMonstersOrTraps = new Map<number, RegionInstance>();
		var regionsWithItems = new Map<number, RegionInstance>();
		var doesDefaultRoomHaveMonsters = config.defaultRoomCategory.monsters && config.defaultRoomCategory.monsters.objects && config.defaultRoomCategory.monsters.objects.length > 0;
		var doesDefaultRoomHaveTraps = config.defaultRoomCategory.traps && config.defaultRoomCategory.traps.objects && config.defaultRoomCategory.traps.objects.length > 0;
		map.rooms.forEach((room, index) => {
			if ((!room.category.monsters && doesDefaultRoomHaveMonsters) || (room.category.monsters && room.category.monsters.objects.length > 0))
			{
				regionsWithMonstersOrTraps.set(index, room);
			}
			if ((!room.category.items && doesDefaultRoomHaveTraps) || (room.category.items && room.category.items.objects.length > 0))
			{
				regionsWithMonstersOrTraps.set(index, room);
			}
		})
		var doesDefaultCorridorHaveMonsters = config.defaultCorridorCategory.monsters && config.defaultCorridorCategory.monsters.objects && config.defaultCorridorCategory.monsters.objects.length > 0;
		var doesDefaultCorridorHaveTraps = config.defaultCorridorCategory.traps && config.defaultCorridorCategory.traps.objects && config.defaultCorridorCategory.traps.objects.length > 0;
		map.corridors.forEach((corridor, index) => {
			if ((!corridor.category.monsters && doesDefaultCorridorHaveMonsters) || (corridor.category.monsters && corridor.category.monsters.objects.length > 0))
			{
				regionsWithItems.set(index, corridor);
			}
			if ((!corridor.category.items && doesDefaultCorridorHaveTraps) || (corridor.category.items && corridor.category.items.objects.length > 0))
			{
				regionsWithItems.set(index, corridor);
			}
		})

		var difficulties = this.randSplitNumber(config.difficulty, regionsWithMonstersOrTraps.keys.length) 
		var diffIndex = 0;
		regionsWithMonstersOrTraps.forEach((region, index) => {
			if (region.isCorridor){
				Object.assign(map.corridors[index], this.genearteRegionEncounter(region, config, difficulties[diffIndex]));
			}
			else{
				Object.assign(map.rooms[index], this.genearteRegionEncounter(region, config, difficulties[diffIndex]));
			}
			diffIndex += 1;
		})

		var values = this.randSplitNumber(config.difficulty, regionsWithItems.keys.length) 
		var valIndex = 0;
		regionsWithItems.forEach((region, index) => {
			if (region.isCorridor){
				Object.assign(map.corridors[index], this.generateRegionItems(region, config, values[valIndex]));
			}
			else{
				Object.assign(map.rooms[index], this.generateRegionItems(region, config, values[valIndex]));
			}
			valIndex += 1;			
		})
	}

	private static randSplitNumber(num: number, length: number) {
		var parts: number[] = [];
		let sumParts = 0;
		for (let i = 0; i < length - 1; i++) {
			const pn = Math.ceil(Math.random() * (num - sumParts))
			parts.push(pn);
			sumParts += pn
		}
		parts.push(num - sumParts);
		return parts.sort(() => Math.random() - 0.5);
	}

	private static generateRegionItems(region: RegionInstance, config: Configuration, goalValue: number){
		var category: RegionCategory;
		var defaultCategory: RegionCategory
		if (region.isCorridor){
			category = (region as CorridorInstance).category;
			defaultCategory = config.defaultCorridorCategory;
		}
		else{
			category = (region as RoomInstance).category;
			defaultCategory = config.defaultRoomCategory;
		}

		var sumVal = 0;
		var itemProbs = category.items ? category.items : defaultCategory.items!;

		var items: Item[] = [];

		while (sumVal < goalValue){
			var item = itemProbs.randPickOne();
			if (item){
				sumVal += item.value;
				items.push(item)
			}
		}

		return {
			items: items,
		} as RegionInstance;
	}

	private static genearteRegionEncounter(region: RegionInstance, config: Configuration, goalDifficulty: number): RegionInstance {
		var category: RegionCategory;
		var defaultCategory: RegionCategory
		if (region.isCorridor){
			category = (region as CorridorInstance).category;
			defaultCategory = config.defaultCorridorCategory;
		}
		else{
			category = (region as RoomInstance).category;
			defaultCategory = config.defaultRoomCategory;
		}

		var state = category.states ? category.states.randPickOne()! : defaultCategory.states!.randPickOne() ?? MonsterState.relaxed;

		var diffModifier = 1;
		if (region.state === MonsterState.asleep){
			diffModifier = 0.8;
		}
		else if (region.state === MonsterState.aware){
			diffModifier = 1.2
		}

		var sumDiff = 0;
		var monsterProbs = category.monsters ? category.monsters : defaultCategory.monsters!;
		var trapProbs = category.traps ? category.traps : defaultCategory.traps!;

		var monsters: Monster[] = [];
		var traps: Trap[] = [];

		while (sumDiff < goalDifficulty){
			if (!trapProbs || !trapProbs.objects || trapProbs.objects.length == 0 || Math.random() < 0.5){
				var monster = monsterProbs.randPickOne();
				if (monster){
					sumDiff += monster.challenge;
					monsters.push(monster)
				}
			}
			else{
				var trap = trapProbs.randPickOne();
				if (trap){
					sumDiff += trap.difficulty;
					traps.push(trap)
				}
			}
		}

		return {
			state: state,
			monsters: monsters,
			traps: traps,
			difficulty: sumDiff
		} as RegionInstance;
	}

	private static tryMatchEntrances(category: CorridorCategory, defaultCategory: CorridorCategory, goalEntranceType: EntranceType | null){
		var entranceType = null;
		if (goalEntranceType && category.entranceTypes && category.entranceTypes.toMap().has(goalEntranceType)){
			entranceType = goalEntranceType;
		}
		else{
			entranceType = category.entranceTypes ? category.entranceTypes!.randPickOne()! : defaultCategory.entranceTypes!.randPickOne()!;
		}
		return entranceType;
	}

	private static getRoomLocations(shape: RoomShape, start: Coordinates, sizeModifier: number, direction: Direction): Coordinates[]{
		var roomShapeInfo = this.findRoomShapeInfo(shape, sizeModifier);
		var roomWidth: number = roomShapeInfo[0] as number;
		var roomHeight: number = roomShapeInfo[1] as number;
		var cutCorners: boolean = roomShapeInfo[2] as boolean;

		var locations: Coordinates[] = [];

		if (roomWidth === 1 && roomHeight === 1) {
			locations.push(new Coordinates(start.x, start.y));
		}
		else{
			var radius = roomWidth/3;
			var offsets = this.findRoomOffsets(roomWidth, roomHeight, direction, cutCorners, radius);
			var iOffset = offsets[0];
			var jOffset = offsets[1];
			var centerPoint = new Coordinates(start.x + iOffset + (roomWidth-1)/2, start.y + jOffset + (roomHeight-1)/2);
			var startPoint = new Coordinates(start.x, start.y);
			
			var closestToStart = new Coordinates(0, 0);
			var closestDistance: number | null = null;
			var includesStart = false;
	
			for (var i = iOffset; i < roomWidth + iOffset; i++){
				for (var j = jOffset; j < roomHeight + jOffset; j++){
					var point = new Coordinates(start.x + i, start.y + j);
					if (!cutCorners || (point.getDistanceTo(centerPoint) <= radius * 2)){
						if (i === 0 && j === 0){
							includesStart = true;
						}
						else if (!includesStart){
							var dist = point.getDistanceTo(startPoint);
							if (closestDistance == null || dist < closestDistance){
								closestToStart = point;
								closestDistance = dist;
							}
						}
						locations.push(point);
					}
				}
			}
	
			if (!includesStart){
				var diff = closestToStart.subtract(startPoint);
				locations.forEach((value, index, arr) => {
					arr[index] = value.subtract(diff);
				});
			}
		}		

		return locations;
	}

	private static findRoomShapeInfo(shape: RoomShape, sizeModifier: number): (number|boolean)[]{
		var roomWidth: number;
		var roomHeight: number;
		var cutCorners: boolean = false;
		var sqrArea: number = Math.max(this.defaultSqrtArea / 2, Math.random()*this.defaultSqrtArea);
		switch(shape){
			case (RoomShape.square):
				roomWidth = roomHeight = Math.ceil(this.defaultSqrtArea);
				break;
			case (RoomShape.rectangle):
				if (Math.random() > 0.5){
					roomWidth = Math.max(2, Math.floor(Math.random() * sqrArea));
					roomHeight = Math.ceil((sqrArea*sqrArea)/roomWidth);
				}
				else{
					roomHeight = Math.max(2, Math.floor(Math.random()*sqrArea));
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

		return[roomWidth, roomHeight, cutCorners]
	}

	private static findRoomOffsets(roomWidth: number, roomHeight: number, direction: Direction, cutCorners: boolean, radius: number): number[] {
		var iOffset = 0;
		var jOffset = 0;
		if (direction === Direction.up || direction === Direction.down) {
			iOffset = -(Math.floor(Math.random() * (roomWidth - 1)));
			if (direction === Direction.down){
				jOffset = -(roomHeight - 1);
			}
		}
		if (direction === Direction.right || direction === Direction.left) {
			jOffset = -(Math.floor(Math.random() * (roomHeight - 1)));
			if (direction === Direction.left){
				iOffset = -(roomWidth - 1);
			}
		}

		return [Math.round(iOffset), Math.round(jOffset)];
	}

	private static getCorridorLocations(path: Coordinates[], lastDirection: Direction, widthModifier: number): Coordinates[] {
		var locations: Set<Coordinates> = new Set<Coordinates>();
		var widthStart = Math.floor(widthModifier/2);
		for(var i = 0; i < path.length; i++){
			var current = path[i];
			var direction = lastDirection;
			if (i < path.length - 1){
				direction = current.getDirectionTo(path[i + 1]);
			}

			var j;
			if (direction === Direction.up || direction === Direction.down) {
				for(j = 0 - widthStart; j < widthModifier - widthStart; j++){
					locations.add(new Coordinates(current.x + j, current.y));
				}
			}
			else if (direction === Direction.right || direction === Direction.left) {
				for(j = 0 - widthStart; j < widthModifier - widthStart; j++){
					locations.add(new Coordinates(current.x, current.y + j));
				}
			}
		}

		return Array.from(locations);
	}

}