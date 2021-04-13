import React, { Component } from 'react'
import { Direction } from '../constants/Direction';
import { EntranceType } from '../constants/EntranceType';
import { TileType } from '../constants/TileType';
import { Coordinates } from '../models/Coordinates';
import { DungeonMap } from '../models/DungeonMap';
import { RegionInstance } from '../models/RegionInstance';
import CSS from 'csstype';
import DungeonEditor from './DungeonEditor';
import { Grid } from '@material-ui/core';
import cloneDeep from 'lodash/cloneDeep';
import { RegionCategory } from '../models/RegionCategory';
import { TileSet } from '../models/TileSet';
import lodash from 'lodash';
import { Probabilities } from '../generator/Probabilities';
import { RoomCategory } from '../models/RoomCategory';
import { CorridorCategory } from '../models/CorridorCategory';

type Props = {
    map: DungeonMap | null;
	canvasProps: any | null;
}

type State = {
	map: DungeonMap | null;
	selectedRegion: RegionInstance | null;
	selectedCategory: RegionCategory | null;
}

class DungeonDisplay extends Component {
		
	private backgroundRef: React.RefObject<any>;
	private mainRef: React.RefObject<any>;
	private hiddenRef: React.RefObject<any>;
	private combinedRef: React.RefObject<any>;
	private selectionRef: React.RefObject<any>;
	props: Props;
	state: State;

	private containerStyle: CSS.Properties = {
		display: 'grid'
	}

	private combinedStyle: CSS.Properties = {
		gridArea: '1/1',
		visibility: 'hidden'
	}

	private spacedStyle: CSS.Properties = {
		margin: "15px"
	}

	constructor(props: Props) {
		super(props)
		this.props = props
		this.state = {
			map: cloneDeep(props.map),
			selectedRegion: null,
			selectedCategory: null
		};
		this.backgroundRef = React.createRef();
		this.mainRef = React.createRef();
		this.hiddenRef = React.createRef();
		this.selectionRef = React.createRef();
		this.combinedRef = React.createRef();
		
		this.getSingleImage = this.getSingleImage.bind(this);
		this.getMultipleImages = this.getMultipleImages.bind(this);
		this.onChange = this.onChange.bind(this);
		this.mouseUpInMap = this.mouseUpInMap.bind(this);
		this.onSelectCategory = this.onSelectCategory.bind(this);
	}
	
	private getCanvasStyle(zIndex: number): CSS.Properties {
		return {
			gridArea: '1/1',
			zIndex: zIndex
		}
	}

	componentDidMount() {
		if (this.props.map !== this.state.map){
			this.setMapState(this.props.map);
			this.setState({
				selectedRegion: null,
				selectedCategory: null});
			if (this.props.map){
				this.drawDungeon(this.props.map);
			}
		}
	}

	componentDidUpdate(prevProps: Props) {
		if (prevProps.map !== this.props.map && this.props.map !== this.state.map){
			this.setMapState(this.props.map);
			this.setState({
				selectedRegion: null,
				selectedCategory: null});
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
	}

	private onChange(map: DungeonMap){
		if (map !== this.state.map){
			this.setMapState(map);
			this.drawDungeon(map);
		}
	}

	private setMapState(map: DungeonMap | null){
		var newMap = null;
		if (map){
			newMap = cloneDeep(map);
			newMap.config.roomCategories = this.getAllRoomCats(newMap);
			newMap.config.corridorCategories = this.getAllCorridorCats(newMap);
		}
		this.setState({map: newMap});
	}

	private getAllRoomCats(map: DungeonMap) {
		var probs;
		if (map && map.config && map.config.roomCategories){
			probs = map.config.roomCategories;
		}
		else{
			probs = new Probabilities<RoomCategory>(null);
		}
		if (!probs.objects || !probs.objects.find((item: any) => lodash.isEqual(item, map.config.defaultRoomCategory))) {
			probs.add(map.config.defaultRoomCategory)
		}
		return probs;
	}

	private getAllCorridorCats(map: DungeonMap) {
		var probs;
		if (map && map.config && map.config.corridorCategories){
			probs = map.config.corridorCategories;
		}
		else{
			probs = new Probabilities<CorridorCategory>(null);
		}
		if (!probs.objects || !probs.objects.find((item: any) => lodash.isEqual(item, map.config.defaultCorridorCategory))) {
			probs.add(map.config.defaultCorridorCategory)
		}
		return probs;
	}

	getSingleImage(): Map<string, any>{
		const canvases = this.getCanvases();

		var combinedCanvas = this.combinedRef.current;
		var context = combinedCanvas.getContext('2d');

		canvases.forEach((canvas) => {
			context.drawImage(canvas, 0, 0);
		})

		// TODO: add encounter data
		var namesToFiles = new Map<string, string>();
		namesToFiles.set("DungeonMap.png", combinedCanvas.toDataURL("image/png"));
		return namesToFiles;
	}

	getMultipleImages(): Map<string, any>{
		var urls = this.getCanvases().map((canvas) => canvas.toDataURL("image/png"));
		var namesToFiles = new Map<string, string>();
		namesToFiles.set("DungeonMap_Background.png", urls[0]);
		namesToFiles.set("DungeonMap_Main.png", urls[1]);
		namesToFiles.set("DungeonMap_Hidden.png", urls[2]);
		namesToFiles.set("DungeonMap.png", urls[3]);

		// TODO: add encounter data
		return namesToFiles;
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

		for (var x = - 1; x < width + 1; x++){
			for (var y = -1; y < height + 1; y++){
				var region = dungeonMap.getRegionInstance(x, y);
				var startx = dungeonMap.tileSize * (x + 1);
				var starty = canvasHeight - dungeonMap.tileSize * (y + 2);
				if (region && !dungeonMap.isOutOfBounds(x, y)){
					var tileSet = region.tileSet ? region.tileSet : region.isCorridor ? dungeonMap.config.defaultCorridorCategory.tileSets!.randPickOne() : dungeonMap.config.defaultRoomCategory.tileSets!.randPickOne()
					contexts[1].drawImage(tileSet!.get(TileType.floor), startx, starty);
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
				var tileSet = region.tileSet ? region.tileSet : region.isCorridor ? dungeonMap.config.defaultCorridorCategory.tileSets!.randPickOne() : dungeonMap.config.defaultRoomCategory.tileSets!.randPickOne();
				context.drawImage(tileSet!.get(tileType), startx, starty);
			}
			else if (nextRegion && !nextIsOut && nextRegion !== region){
				var tileSet = nextRegion.tileSet ? nextRegion.tileSet : nextRegion.isCorridor ? dungeonMap.config.defaultCorridorCategory.tileSets!.randPickOne() : dungeonMap.config.defaultRoomCategory.tileSets!.randPickOne()
				context.drawImage(tileSet!.get(tileType), startx, starty);
			}
		}
	}

	private drawEntrances(region: RegionInstance, dungeonMap: DungeonMap, context: any, hiddenContext: any, canvasHeight: number){
		var tileSet = region.tileSet ? region.tileSet : region.isCorridor ? dungeonMap.config.defaultCorridorCategory.tileSets!.randPickOne() : dungeonMap.config.defaultRoomCategory.tileSets!.randPickOne();
		region.entrances.forEach((entrance) => {
			if (!dungeonMap.isOutOfBounds(entrance.location.x, entrance.location.y) && dungeonMap.getRegionInstance(entrance.location.x, entrance.location.y) === region){
				var contextToUse = entrance.type === EntranceType.secret ? hiddenContext : context;
				var startx = dungeonMap.tileSize * (entrance.location.x + 1);
				var starty = canvasHeight - dungeonMap.tileSize * (entrance.location.y + 2);
	
				var tile = this.getTileForEntrance(entrance.direction, entrance.type, tileSet!);

				contextToUse.drawImage(tile, startx, starty);
				
				// add in the other side of external doors
				var adjacentLocation = entrance.location.getNextLocation(entrance.direction);
				if (adjacentLocation && (dungeonMap.isOutOfBounds(adjacentLocation.x, adjacentLocation.y) || !dungeonMap.getRegionInstance(adjacentLocation.x, adjacentLocation.y))){
					startx = dungeonMap.tileSize * (adjacentLocation.x + 1);
					starty = canvasHeight - dungeonMap.tileSize * (adjacentLocation.y + 2);
					tile = this.getTileForEntrance(Direction.getOppositeDirection(entrance.direction), entrance.type, tileSet!);
					contextToUse.drawImage(tile, startx, starty);
				}
			}			
		})
	}

	clearDungeon(){
		var canvases = this.getCanvases();
		canvases.forEach((canvas) => {
			this.clearCanvas(canvas);
		})
	}
	
	private getTileForEntrance(direction: Direction, type: EntranceType, tileSet: TileSet): any{
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
				tile = tileSet.get(tileTypes[0]);
				break;
			case (EntranceType.locked):
				tile = tileSet.get(tileTypes[1]);
				break
			case (EntranceType.secret):
				tile = tileSet.get(tileTypes[2]);
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

		const selectionCanvas = this.selectionRef.current;
		if (!selectionCanvas){
			return []
		}

		return [backgroundCanvas, mainCanvas, hiddenCanvas, combinedCanvas, selectionCanvas];
	}

	private mouseUpInMap(event: any) {
		if (this.state.map){
			var canvas = this.selectionRef.current;
			let rect = canvas.getBoundingClientRect();
			let x = Math.floor((event.clientX - rect.left)/this.state.map.tileSize - 1);
			let y = Math.floor((canvas.height - (event.clientY - rect.top))/this.state.map.tileSize - 1);

			var region = null;
			if (!this.state.map.isOutOfBounds(x, y)){
				region = this.state.map.getRegionInstance(x, y);
			}

			if (region != this.state.selectedRegion){
				this.clearCanvas(canvas);
				if (region){
					this.selectRegion(region);
				}
				this.setState({selectedCategory: null, selectedRegion: region});
			}
		}
	}

	private selectRegion(region: RegionInstance){
		if (region && this.state.map){
			var map = this.state.map as DungeonMap;
			var canvas = this.selectionRef.current;
			var context = canvas.getContext("2d");
			region.locations.forEach((location) => {
				var startx = map.tileSize * (location.x + 1);
				var starty = canvas.height - map.tileSize * (location.y + 2);
				if (region && !map.isOutOfBounds(location.x, location.y) && map.getRegionInstance(location.x, location.y) === region){
					context.fillStyle = "rgba(255, 255, 255, 0.5)";
					context.fillRect(startx, starty, map.tileSize, map.tileSize);
				}
			})
		}
	}

	private selectRegionCategory(category: RegionCategory){
		if (category && this.state.map){
			var regions = [];
			if (category.isCorridor){
				regions = this.state.map.corridors;
			}
			else {
				regions = this.state.map.rooms;
			}
			regions.forEach((region: any) => {
				if (lodash.isEqual(region.category, category)){
					this.selectRegion(region);
				}
			})
		}
	}

	private onSelectCategory(category: RegionCategory){
		if (category != this.state.selectedCategory){
			var canvas = this.selectionRef.current;
			this.clearCanvas(canvas);
			if (category){
				this.selectRegionCategory(category);
			}
			this.setState({selectedCategory: category, selectedRegion: null});
		}
	}

	private clearCanvas(canvas: any){
		var context = canvas.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);
	}
	
	render() {
		return <div>
			<Grid 
				container 
				direction="row"
				alignItems="center">
					<div onMouseUp={this.mouseUpInMap}>
						<div style={{...this.containerStyle, ...this.spacedStyle}}>
							<canvas style={this.getCanvasStyle(1)} ref={this.backgroundRef} {...this.props.canvasProps}/>
							<canvas style={this.getCanvasStyle(2)} ref={this.mainRef} {...this.props.canvasProps}/>
							<canvas style={this.getCanvasStyle(3)} ref={this.hiddenRef} {...this.props.canvasProps}/>
							<canvas style={this.getCanvasStyle(4)} ref={this.selectionRef} {...this.props.canvasProps}/>
							<canvas style={this.combinedStyle} ref={this.combinedRef} {...this.props.canvasProps}/>
						</div>
					</div>

					<div style={this.spacedStyle}>
						<DungeonEditor map={this.state.map} getSingleImage={this.getSingleImage} getMultipleImages={this.getMultipleImages} onChange={this.onChange} selectCategory={this.onSelectCategory}></DungeonEditor>
					</div>
			</Grid>
		</div>
	}
}

export default DungeonDisplay;