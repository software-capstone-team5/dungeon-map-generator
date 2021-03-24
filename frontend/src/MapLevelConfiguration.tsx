import React from 'react';
import DifficultySlider from './DifficultySlider';
import EnumRadio from './EnumRadio';

//TODO: Import
enum Size {
	small = "SMALL",
	medium = "MEDIUM",
	large = "LARGE"
}

//TODO: Import
enum CorridorComplexity {
	small = "SMALL",
	medium = "MEDIUM",
	large = "LARGE"
}

//TODO: Import
enum CorridorLength {
	small = "SMALL",
	medium = "MEDIUM",
	large = "LARGE"
}

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
                <DifficultySlider/>
                <EnumRadio<Size> enum={Size} label="Map Size"/>
                <EnumRadio<CorridorComplexity> enum={CorridorComplexity} label="Corridor Complexity"/>
                <EnumRadio<CorridorLength> enum={CorridorLength} label="Corridor Length"/>
            </div>
        );
    }
}

export default MapLevelConfiguration;