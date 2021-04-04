import React, { Component } from 'react'
import { DungeonMap } from '../models/DungeonMap';

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
				if (region){
					if (region.isCorridor) {
						context.fillStyle = '#AECBD6'
					}
					else{
						context.fillStyle = '#9EAEB2'
					}
				}
				else {
					context.fillStyle = '#B1C294'
				}
				context.fillRect(dungeonMap.tileSize * x, dungeonMap.tileSize * y, dungeonMap.tileSize, dungeonMap.tileSize)
			}
		}
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