import React from 'react';
import { Button } from '@material-ui/core';
import { Configuration } from '../models/Configuration';
import { DungeonGenerator } from '../generator/DungeonGenerator';
import DungeonDisplay from './DungeonDisplay';
import { DungeonMap } from '../models/DungeonMap';
import { Probabilities } from '../generator/Probabilities';
import { TileSet } from '../models/TileSet';
import { MonsterState } from '../constants/MonsterState';
import { Monster } from '../models/Monster';
import { Item } from '../models/Item';
import { EntranceType } from '../constants/EntranceType';
import { Trap } from '../models/Trap';
import { RegionCategory } from '../models/RegionCategory';
import { Size } from '../constants/Size';
import { RoomShape } from '../constants/RoomShape';
import { CorridorWidth } from '../constants/CorridorWidth';
import { RoomCategory } from '../models/RoomCategory';
import { CorridorCategory } from '../models/CorridorCategory';
import { TileType } from '../constants/TileType';
import { CorridorLength } from '../constants/CorridorLength';
import { CorridorComplexity } from '../constants/CorridorComplexity';

type Props = {
    configuration?: Configuration;
}

type State = {
    configuration: Configuration;
    map: DungeonMap | null;
}

class Parent extends React.Component<Props, State> {
	private dungeonDisplay: React.RefObject<DungeonDisplay>

    constructor(props: Props) {
        super(props);

        if (props.configuration !== undefined) {
            this.state = {configuration: props.configuration, map: null};
        } else {
            var defaultConfig = new Configuration();
            defaultConfig.mapSize = Size.medium;
            defaultConfig.corridorComplexity = CorridorComplexity.low;
            defaultConfig.corridorLength = CorridorLength.long;
            var defaultCategory = {
                tileSets: this.getDefaultTileSets(),
                monsters: Probabilities.buildUniform([new Monster()]),
                states: Probabilities.buildUniform([MonsterState.aware, MonsterState.asleep, MonsterState.relaxed]),
                items: Probabilities.buildUniform([new Item("item1", ""), new Item("item2", ""), new Item("item3", "")]),
                entranceTypes: Probabilities.buildUniform([EntranceType.regular, EntranceType.locked, EntranceType.secret]),
                traps: Probabilities.buildUniform([new Trap("trap1", "", 1), new Trap("trap2", "", 2)]),
            } as RegionCategory;

            defaultConfig.defaultRoomCategory = new RoomCategory();
            Object.assign(defaultConfig.defaultRoomCategory, defaultCategory);
            defaultConfig.defaultRoomCategory.sizes = Probabilities.buildUniform([Size.small, Size.medium, Size.large]);
            defaultConfig.defaultRoomCategory.shapes = Probabilities.buildUniform([RoomShape.rectangle, RoomShape.square, RoomShape.nonRectangular]);

            defaultConfig.defaultCorridorCategory = new CorridorCategory();
            Object.assign(defaultConfig.defaultCorridorCategory, defaultCategory);
            defaultConfig.defaultCorridorCategory.widths = Probabilities.buildUniform([CorridorWidth.thin]);
            
            // TODO: Retrieve actual defaults to pass to state instead of generating them above
            this.state = {configuration: defaultConfig, map: null};
        }

        this.dungeonDisplay = React.createRef();

        this.handleGenerate = this.handleGenerate.bind(this);
        this.handleSingleDownload = this.handleSingleDownload.bind(this);
        this.handleLayerDownloads = this.handleLayerDownloads.bind(this);
        this.handleJsonDownload = this.handleJsonDownload.bind(this);
    }

    private getDefaultTileSets(): Probabilities<TileSet>{
        // TODO: Get actual default tile sets
        var defaultSet = new TileSet("default", 48, new Map());
        for (var tileType of Object.values(TileType)){
            var img = new Image();
            img.src = process.env.PUBLIC_URL + "/TileSets/Default/" + tileType + ".png";
            defaultSet.addTileToSet(tileType, img);
        }

        return Probabilities.buildUniform([defaultSet]);
    }

    handleGenerate() {
        this.setState({map: DungeonGenerator.generateDungeon(this.state.configuration)});
    }

    handleSingleDownload() {
        // var current = this.dungeonDisplay.current;
        // if (current && this.state.map){
        //     var url = current.getSingleImage();
        //     var link = document.createElement('a');
        //     link.download = 'DungeonMap.png';
        //     link.href = url[0];
        //     link.click();
        // }
    }

    handleLayerDownloads() {
        // var current = this.dungeonDisplay.current;
        // if (current && this.state.map){
        //     var urls = current.getMultipleImages();
        //     urls.forEach((url, i) => {
        //         // TODO: zip?
        //         var link = document.createElement('a');
        //         link.download = 'DungeonMap' + i + '.png';
        //         link.href = url;
        //         link.click();
        //     })
        // }
    }

    async handleJsonDownload() {
        if (this.state.map){
            var json = this.state.map.getJSON();
            var url = await URL.createObjectURL(new Blob([json], {type: 'application/json'}));
            var link = document.createElement('a');
            link.download = 'DungeonMap.json';
            link.href = url;
            link.click();
        }
    }

    render() {
        return (
            <div>
                <DungeonDisplay map={this.state.map} canvasProps={null} ref={this.dungeonDisplay}></DungeonDisplay>
				<Button onClick={this.handleGenerate} variant="contained">Generate</Button>
				<Button onClick={this.handleSingleDownload} disabled={!this.state.map} variant="contained">Download Single Image</Button>
				<Button onClick={this.handleLayerDownloads} disabled={!this.state.map} variant="contained">Download Layer Images</Button>
				<Button onClick={this.handleJsonDownload} disabled={!this.state.map} variant="contained">Download JSON</Button>
				
            </div>
        );
    }
}

export default Parent;