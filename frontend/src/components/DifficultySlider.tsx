import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import {Configuration} from '../models/Configuration';

type Props = {
    value: number;
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
                value={props.value}
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