import React from 'react';
import { Size } from "./constants/Size";
import { CorridorComplexity } from "./constants/CorridorComplexity";
import { CorridorLength } from "./constants/CorridorLength";
import DifficultySlider from './DifficultySlider';
import EnumRadio from './EnumRadio';

type Props = {

};

type State = {

};

class MapLevelConfiguration extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(newValue: Size | CorridorComplexity | CorridorLength) {

    }

    render() {
        return (
            <div>
                <DifficultySlider onChange={()=>console.log()}/>
                <div><EnumRadio<Size> enum={Size} label="Map Size" onChange={this.handleChange}/></div>
                <div><EnumRadio<CorridorComplexity> enum={CorridorComplexity} label="Corridor Complexity" onChange={this.handleChange}/></div>
                <div><EnumRadio<CorridorLength> enum={CorridorLength} label="Corridor Length" onChange={this.handleChange}/></div>
            </div>
        );
    }
}

export default MapLevelConfiguration;