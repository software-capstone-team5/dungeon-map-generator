import {Slider} from '@material-ui/core';
import {Typography} from '@material-ui/core';
import {Configuration} from '../models/Configuration';
import {nameOf} from '../utils/util';

type Props = {
    initialValue: number;
    onChange: (value: number) => void;
}

function DifficultySlider(props: Props) {
    return (
        <div>
            <Typography id="input-slider" gutterBottom>
                Difficulty Level
            </Typography>
            <Slider
                aria-labelledby="input-slider"
                defaultValue={props.initialValue}
                onChange={(e,v) => props.onChange(v as number)}
                valueLabelDisplay="auto"
                step={1}
                marks
                min={Configuration.minDifficulty}
                max={Configuration.maxDifficulty}
            />
        </div>
    );
}

export default DifficultySlider;