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
            var defaultCategory = {
                tileSets: Probabilities.buildUniform([new TileSet(new Map())]),
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
            defaultConfig.defaultCorridorCategory.widths = Probabilities.buildUniform([CorridorWidth.thin, CorridorWidth.medium, CorridorWidth.wide]);
            
            // TODO: Retrieve actual defaults to pass to state instead of generating them above
            this.state = {configuration: defaultConfig, map: null};
        }

        this.handleGenerate = this.handleGenerate.bind(this);
    }

    handleGenerate() {
        this.setState({map: DungeonGenerator.generateDungeon(this.state.configuration)});
    }

    render() {
        return (
            <div>
				<Button onClick={this.handleGenerate} variant="contained">Generate</Button>
				<DungeonDisplay map={this.state.map} canvasProps={null}></DungeonDisplay>
            </div>
        );
    }
}

export default Parent;