import React, { Component } from 'react'
import { Direction } from '../constants/Direction';
import { EntranceType } from '../constants/EntranceType';
import { TileType } from '../constants/TileType';
import { Coordinates } from '../models/Coordinates';
import { DungeonMap } from '../models/DungeonMap';
import { RegionInstance } from '../models/RegionInstance';

type Props = {
    map: DungeonMap | null;
	canvasProps: any | null;
}

class DungeonDisplay extends Component {
	private canvasRef: React.RefObject<any>;
	props: Props;
	
	constructor(props: Props) {
		super(props)
		this.props = props
		this.canvasRef = React.createRef();
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
		return <canvas ref={this.canvasRef} {...this.props.canvasProps}/>
	}

	drawDungeon(dungeonMap: DungeonMap) {
		const canvas = this.canvasRef.current;
		if (!canvas){
			return
		}

		const context = canvas.getContext('2d');
		if (!context){
			return
		}
		
		var width = dungeonMap.getWidth();
		var height = dungeonMap.getHeight();
		canvas.width = width * dungeonMap.tileSize;
		canvas.height = height * dungeonMap.tileSize;

		for (var x = 0; x < width; x++){
			for (var y = 0; y < height; y++){
				var region = dungeonMap.getRegionInstance(x, y);
				var startx = dungeonMap.tileSize * x;
				var starty =  canvas.height - dungeonMap.tileSize * (y + 1);
				if (region){
					if (y == 0 || y == height){
						var i = 0;
					}
					context.drawImage(region.tileSet.get(TileType.floor), startx, starty);
				}
				else {
					context.fillStyle = '#E0D3AF';
					context.fillRect(startx, starty, dungeonMap.tileSize, dungeonMap.tileSize);
				}
				this.drawWalls(region, dungeonMap, x, y, width, height, context, startx, starty);
			}
		}

		dungeonMap.rooms.forEach((room) => {
			this.drawEntrances(room, dungeonMap, context, canvas.height);
		});
		dungeonMap.corridors.forEach((corridor) => {
			this.drawEntrances(corridor, dungeonMap, context, canvas.height);
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

	private drawEntrances(region: RegionInstance, dungeonMap: DungeonMap, context: any, canvasHeight: number){
		region.entrances.forEach((entrance) => {
			var startx = dungeonMap.tileSize * entrance.location.x;
			var starty =  canvasHeight - dungeonMap.tileSize * (entrance.location.y + 1);

			var tileTypes;
			switch(entrance.type){
				case (EntranceType.regular):
					tileTypes = [TileType.regularDoorLeft, TileType.regularDoorRight, TileType.regularDoorUp,TileType.regularDoorDown];
					break;
				case (EntranceType.locked):
					tileTypes = [TileType.lockedDoorLeft, TileType.lockedDoorRight, TileType.lockedDoorUp, TileType.secretDoorDown];
					break
				case (EntranceType.secret):
					tileTypes = [TileType.secretDoorLeft, TileType.secretDoorRight, TileType.secretDoorUp, TileType.secretDoorDown];
			}

			switch(entrance.direction){
				case (Direction.left):
					context.drawImage(region.tileSet.get(tileTypes[0]), startx, starty);
					break;
				case (Direction.right):
					context.drawImage(region.tileSet.get(tileTypes[1]), startx, starty);
					break;
				case (Direction.up):
					context.drawImage(region.tileSet.get(tileTypes[2]), startx, starty);
					break;
				case (Direction.down):
					context.drawImage(region.tileSet.get(tileTypes[3]), startx, starty);
			}
		})
	}

	clearDungeon(){
		const canvas = this.canvasRef.current;
		if (!canvas){
			return
		}

		const context = canvas.getContext('2d');
		if (!context){
			return
		}

		context.fillStyle = "rgba(255, 255, 255, 0)";
		context.fillRect(0, 0, canvas.width, canvas.height);
	}
}

export default DungeonDisplay;