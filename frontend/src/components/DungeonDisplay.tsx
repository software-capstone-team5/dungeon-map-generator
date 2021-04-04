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
		// this.containerRef = React.createRef();
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
		var canvasWidth = width * dungeonMap.tileSize;
		var canvasHeight = height * dungeonMap.tileSize;
		canvases.forEach((canvas) => {
			canvas.width = canvasWidth;
			canvas.height = canvasHeight;
		})

		// TODO: Use background image;
		contexts[0].fillStyle = '#E0D3AF';
		contexts[0].fillRect(0, 0, canvasWidth, canvasHeight);

		for (var x = 0; x < width; x++){
			for (var y = 0; y < height; y++){
				var region = dungeonMap.getRegionInstance(x, y);
				var startx = dungeonMap.tileSize * x;
				var starty =  canvasHeight - dungeonMap.tileSize * (y + 1);
				if (region){
					if (y == 0 || y == height){
						var i = 0;
					}
					contexts[1].drawImage(region.tileSet.get(TileType.floor), startx, starty);
				}
				this.drawWalls(region, dungeonMap, x, y, width, height, contexts[1], startx, starty);
			}
		}

		dungeonMap.rooms.forEach((room) => {
			this.drawEntrances(room, dungeonMap, contexts[1], contexts[2], canvasHeight);
		});
		dungeonMap.corridors.forEach((corridor) => {
			this.drawEntrances(corridor, dungeonMap, contexts[1], contexts[2], canvasHeight);
		});
	}

	private drawWalls(region: RegionInstance | null, dungeonMap: DungeonMap, x: number, y: number, width: number, height: number, context: any, startx: number, starty: number){
		var adjacent = [[new Coordinates(x + 1, y), TileType.wallRight],
			[new Coordinates(x - 1, y), TileType.wallLeft],
			[new Coordinates(x, y + 1), TileType.wallUp],
			[new Coordinates(x, y - 1), TileType.wallDown]];
		for (var i = 0; i < adjacent.length; i++){
			var nextPoint = adjacent[i][0] as Coordinates;
			var tileType = adjacent[i][1] as TileType;
			var nextRegion = dungeonMap.getRegionInstance(nextPoint.x, nextPoint.y);
			if (region && (nextRegion !== region || dungeonMap.isOutOfBounds(nextPoint.x, nextPoint.y))){
				context.drawImage(region.tileSet.get(tileType), startx, starty);
			}
			else if (nextRegion && nextRegion !== region && !dungeonMap.isOutOfBounds(nextPoint.x, nextPoint.y)){
				context.drawImage(nextRegion.tileSet.get(tileType), startx, starty);
			}
		}
	}

	private drawEntrances(region: RegionInstance, dungeonMap: DungeonMap, context: any, hiddenContext: any, canvasHeight: number){
		region.entrances.forEach((entrance) => {
			var startx = dungeonMap.tileSize * entrance.location.x;
			var starty =  canvasHeight - dungeonMap.tileSize * (entrance.location.y + 1);

			var tileTypes;
			switch(entrance.direction){
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

			switch(entrance.type){
				case (EntranceType.regular):
					context.drawImage(region.tileSet.get(tileTypes[0]), startx, starty);
					break;
				case (EntranceType.locked):
					context.drawImage(region.tileSet.get(tileTypes[1]), startx, starty);
					break
				case (EntranceType.secret):
					hiddenContext.drawImage(region.tileSet.get(tileTypes[2]), startx, starty);
					
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