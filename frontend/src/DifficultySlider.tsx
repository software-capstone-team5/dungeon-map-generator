import {Slider} from '@material-ui/core';
import {Typography} from '@material-ui/core';
import {Configuration} from './models/Configuration';

type Props = {
    onChange: (event: React.ChangeEvent<{}>, value: number | number[]) => void;
}

function DifficultySlider(props: Props) {
    return (
        <div>
            <Typography id="input-slider" gutterBottom>
                Difficulty Level
            </Typography>
            <Slider
                aria-labelledby="input-slider"
                defaultValue={Configuration.maxDifficulty/2}
                onChange={props.onChange}
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