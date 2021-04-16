// REQ-12: Edit.MapLevelConfiguration.DifficultyLevel

import FormLabel from '@material-ui/core/FormLabel';
import Slider from '@material-ui/core/Slider';
import { Configuration } from '../models/Configuration';

type Props = {
    disabled?: boolean;
    style?: any;
    value: number;
    onChange: (value: number) => void;
}

DifficultySlider.defaultProps = {
    disabled: false,
}

function DifficultySlider(props: Props) {
    return (
        <div style={{width: '100%'}}>
            <FormLabel
                disabled={props.disabled}
                id="input-slider"
            >
                Difficulty Level
            </FormLabel>
            <Slider
                disabled={props.disabled}
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