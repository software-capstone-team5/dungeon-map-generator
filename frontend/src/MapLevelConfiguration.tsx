import React from 'react';
import {Slider} from '@material-ui/core';
import SizeRadio from "./SizeRadio";

// REQ-12: Edit.MapLevelConfiguration.DifficultyLevel - The system allows the user to select a difficulty level for the generated dungeon, prior to generation. The difficulty level will be restricted to a numeric range.
// REQ-13: Edit.MapLevelConfiguration.Size - The system allows the user to select a size for the generated dungeon, prior to generation. The available sizes are Small, Medium, and Large.
// REQ-14: Edit.MapLevelConfiguration.CorridorComplexity - The system allows the user to select the desired corridor complexity for the generated dungeon, prior to generation. The corridor complexity determines how many twists and turns there are in the dungeon. The available options are Low, Medium, and High.
// REQ-15: Edit.MapLevelConfiguration.CorridorLength- The system allows the user to select the desired corridor length for the generated dungeon, prior to generation. The exact length of the corridors will vary, but their range of possible lengths can be determined by the user. The options are Small, Medium, and Large.

type Props = {

};

type State = {

};

class MapLevelConfiguration extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Slider
                    defaultValue={30}
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={1} // Make a call to get this information
                    max={20}
                />
                <SizeRadio label="Map Size"/>
            </div>
        );
    }
}

export default MapLevelConfiguration;