import React from 'react';
import {Slider} from '@material-ui/core';
import {Typography} from '@material-ui/core';

type Props = {
};

type State = {
    difficultyLevel: number;
};

class DifficultySlider extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {difficultyLevel: 10};

        this.handleSliderChange = this.handleSliderChange.bind(this);
    }

    handleSliderChange(event: any, newValue: any) {
        this.setState({difficultyLevel: newValue});
    };

    render() {
        return (
            <div>
            <Typography id="input-slider" gutterBottom>
                Difficulty Level
            </Typography>
            <Slider
                aria-labelledby="input-slider"
                value={this.state.difficultyLevel}
                onChange={this.handleSliderChange}
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1} //TODO: Make a call to get this information
                max={20}
            />
            </div>
        );
    }
}

export default DifficultySlider;