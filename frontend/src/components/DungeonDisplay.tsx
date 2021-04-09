import React, { Component } from 'react'
import { Direction } from '../constants/Direction';
import { EntranceType } from '../constants/EntranceType';
import { TileType } from '../constants/TileType';
import { Coordinates } from '../models/Coordinates';
import { DungeonMap } from '../models/DungeonMap';
import { RegionInstance } from '../models/RegionInstance';
import CSS from 'csstype';

type Props = {
    map: DungeonMap | null;
	canvasProps: any | null;
}

class DungeonDisplay extends Component {
	private backgroundRef: React.RefObject<any>;
	private mainRef: React.RefObject<any>;
	private hiddenRef: React.RefObject<any>;
	private combinedRef: React.RefObject<any>;
	props: Props;

	private containerStyle: CSS.Properties = {
		display: 'grid'
	}
	
	private canvasStyle: CSS.Properties = {
		gridArea: '1/1'
	}

	private combinedStyle: CSS.Properties = {
		gridArea: '1/1',
		visibility: 'hidden'
	}

	constructor(props: Props) {
		super(props)
		this.props = props
		this.backgroundRef = React.createRef();
		this.mainRef = React.createRef();
		this.hiddenRef = React.createRef();
		this.combinedRef = React.createRef();
	}

	componentDidMount() {
		if (this.props.map){
			this.drawDungeon(this.props.map)
		}
	}

	componentDidUpdate(prevProps: Props) {
		if (prevProps.map) {
			// TODO - only update changes?
			if (this.props.map){
				this.drawDungeon(this.props.map);
			}
			else{
				this.clearDungeon();
			}
		}
		else if (this.props.map) { 
			this.drawDungeon(this.props.map);
		}
	}
	
	render() {
		return <div style={this.containerStyle}>
			<canvas style={this.canvasStyle} ref={this.backgroundRef} {...this.props.canvasProps}/>
			<canvas style={this.canvasStyle} ref={this.mainRef} {...this.props.canvasProps}/>
			<canvas style={this.canvasStyle} ref={this.hiddenRef} {...this.props.canvasProps}/>
			<canvas style={this.combinedStyle} ref={this.combinedRef} {...this.props.canvasProps}/>
		</div>
	}

	getSingleImage(){
		const canvases = this.getCanvases();

		var combinedCanvas = this.combinedRef.current;
		var context = combinedCanvas.getContext('2d');

		canvases.forEach((canvas) => {
			context.drawImage(canvas, 0, 0);
		})

		return combinedCanvas.toDataURL("image/png");
	}

	getMultipleImages(): any[]{
		return this.getCanvases().map((canvas) => canvas.toDataURL("image/png"));
	}

	drawDungeon(dungeonMap: DungeonMap) {
		var canvases = this.getCanvases();
		var contexts = canvases.map((canvas) => canvas.getContext('2d'));
		
		var width = dungeonMap.getWidth();
		var height = dungeonMap.getHeight();
		var canvasWidth = (width + 2) * dungeonMap.tileSize;
		var canvasHeight = (height + 2) * dungeonMap.tileSize;
		canvases.forEach((canvas) => {
			canvas.width = canvasWidth;
			canvas.height = canvasHeight;
		})

		// TODO: Use background image;
		contexts[0].fillStyle = '#E0D3AF';
		contexts[0].fillRect(0, 0, canvasWidth, canvasHeight);

		// dungeonMap.corridors.forEach((corridor) => {
		// 	corridor.locations.forEach((location) => {
				// var startx = dungeonMap.tileSize * (location.x + 1);
				// var starty = canvasHeight - dungeonMap.tileSize * (location.y + 2);
		// 		if (corridor){
		// 			if (location.y == 0 || location.y == height){
		// 				var i = 0;
		// 			}
		// 			contexts[1].drawImage(corridor.tileSet.get(TileType.floor), startx, starty);
		// 		}
		// 		// this.drawWalls(corridor, dungeonMap, location.x, location.y, width, height, contexts[1], startx, starty);
		// 	})
		// });

		// dungeonMap.rooms.forEach((room) => {
		// 	room.locations.forEach((location) => {
				// var startx = dungeonMap.tileSize * (location.x + 1);
				// var starty = canvasHeight - dungeonMap.tileSize * (location.y + 2);
		// 		if (room){
		// 			if (location.y == 0 || location.y == height){
		// 				var i = 0;
		// 			}
		// 			contexts[1].drawImage(room.tileSet.get(TileType.floor), startx, starty);
		// 		}
		// 		// this.drawWalls(room, dungeonMap, location.x, location.y, width, height, contexts[1], startx, starty);
		// 	})
		// });

		for (var x = - 1; x < width + 1; x++){
			for (var y = -1; y < height + 1; y++){
				var region = dungeonMap.getRegionInstance(x, y);
				var startx = dungeonMap.tileSize * (x + 1);
				var starty = canvasHeight - dungeonMap.tileSize * (y + 2);
				if (region && !dungeonMap.isOutOfBounds(x, y)){
					contexts[1].drawImage(region.tileSet.get(TileType.floor), startx, starty);
				}
				this.drawWalls(region, dungeonMap, x, y, contexts[1], startx, starty);
			}
		}

		dungeonMap.rooms.forEach((room) => {
			this.drawEntrances(room, dungeonMap, contexts[1], contexts[2], canvasHeight);
		});
		dungeonMap.corridors.forEach((corridor) => {
			this.drawEntrances(corridor, dungeonMap, contexts[1], contexts[2], canvasHeight);
		});
	}

	private drawWalls(region: RegionInstance | null, dungeonMap: DungeonMap, x: number, y: number, context: any, startx: number, starty: number){
		var adjacent = [[new Coordinates(x + 1, y), TileType.wallRight],
			[new Coordinates(x - 1, y), TileType.wallLeft],
			[new Coordinates(x, y + 1), TileType.wallUp],
			[new Coordinates(x, y - 1), TileType.wallDown]];
		for (var i = 0; i < adjacent.length; i++){
			var nextPoint = adjacent[i][0] as Coordinates;
			var tileType = adjacent[i][1] as TileType;
			var nextRegion = dungeonMap.getRegionInstance(nextPoint.x, nextPoint.y);
			var currentIsOut = dungeonMap.isOutOfBounds(x, y);
			var nextIsOut = dungeonMap.isOutOfBounds(nextPoint.x, nextPoint.y);
			if (region && ((currentIsOut && !nextIsOut && nextRegion) || (!currentIsOut && (nextRegion !== region || nextIsOut)))){
				context.drawImage(region.tileSet.get(tileType), startx, starty);
			}
			else if (nextRegion && !nextIsOut && nextRegion !== region){
				context.drawImage(nextRegion.tileSet.get(tileType), startx, starty);
			}
		}
	}

	private drawEntrances(region: RegionInstance, dungeonMap: DungeonMap, context: any, hiddenContext: any, canvasHeight: number){
		region.entrances.forEach((entrance) => {
			if (!dungeonMap.isOutOfBounds(entrance.location.x, entrance.location.y) && dungeonMap.getRegionInstance(entrance.location.x, entrance.location.y) === region){
				var contextToUse = entrance.type === EntranceType.secret ? hiddenContext : context;
				var startx = dungeonMap.tileSize * (entrance.location.x + 1);
				var starty = canvasHeight - dungeonMap.tileSize * (entrance.location.y + 2);
	
				var tile = this.getTileForEntrance(entrance.direction, entrance.type, region);

				contextToUse.drawImage(tile, startx, starty);
				
				// add in the other side of external doors
				var adjacentLocation = entrance.location.getNextLocation(entrance.direction);
				if (adjacentLocation && (dungeonMap.isOutOfBounds(adjacentLocation.x, adjacentLocation.y) || !dungeonMap.getRegionInstance(adjacentLocation.x, adjacentLocation.y))){
					startx = dungeonMap.tileSize * (adjacentLocation.x + 1);
					starty = canvasHeight - dungeonMap.tileSize * (adjacentLocation.y + 2);
					tile = this.getTileForEntrance(Direction.getOppositeDirection(entrance.direction), entrance.type, region);
					contextToUse.drawImage(tile, startx, starty);
				}
			}			
		})
	}

	clearDungeon(){
		var canvases = this.getCanvases();
		var contexts = canvases.map((canvas) => canvas.getContext('2d'));
		contexts.forEach((context) => {
			context.fillStyle = "rgba(255, 255, 255, 0)";
			context.fillRect(0, 0, canvases[0].width, canvases[0].height);
		})
	}
	
	private getTileForEntrance(direction: Direction, type: EntranceType, region: RegionInstance): any{
		var tileTypes;
		switch(direction){
			case (Direction.left):
				tileTypes = [TileType.regularDoorLeft, TileType.lockedDoorLeft, TileType.secretDoorLeft];
				break;
			case (Direction.right):
				tileTypes = [TileType.regularDoorRight, TileType.lockedDoorRight, TileType.secretDoorRight];
				break;
			case (Direction.up):
				tileTypes = [TileType.regularDoorUp, TileType.lockedDoorUp, TileType.secretDoorUp];
				break;
			case (Direction.down):
				tileTypes = [TileType.regularDoorDown, TileType.lockedDoorDown, TileType.secretDoorDown];
		}
		var tile;
		switch(type){
			case (EntranceType.regular):
				tile = region.tileSet.get(tileTypes[0]);
				break;
			case (EntranceType.locked):
				tile = region.tileSet.get(tileTypes[1]);
				break
			case (EntranceType.secret):
				tile = region.tileSet.get(tileTypes[2]);
		}
		return tile;
	}

	private getCanvases(){
		const backgroundCanvas = this.backgroundRef.current;
		if (!backgroundCanvas){
			return []
		}
		const mainCanvas = this.mainRef.current;
		if (!mainCanvas){
			return []
		}
		const hiddenCanvas = this.hiddenRef.current;
		if (!hiddenCanvas){
			return []
		}
		const combinedCanvas = this.combinedRef.current;
		if (!combinedCanvas){
			return []
		}

		return [backgroundCanvas, mainCanvas, hiddenCanvas, combinedCanvas];
	}
}

export default DungeonDisplay;