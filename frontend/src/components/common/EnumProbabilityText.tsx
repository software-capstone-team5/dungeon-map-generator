
import { makeStyles } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { useRef } from 'react';
import { Probabilities } from '../../generator/Probabilities';


type Props<EnumType extends number | string> = {
    disabled?: boolean;
    label: string;
    probs: Probabilities<EnumType> | null;
    enum: {[s: string]: EnumType};
    onProbUpdate: (newList: Probabilities<EnumType> | null) => void;
};

const useStyles = makeStyles((theme) => ({
    margin: {
      margin: theme.spacing(1),
    },
    label: {
        width: "100%",
        paddingRight: theme.spacing(1),
    },
}));

EnumProbabilityText.defaultProps = {
    disabled: false
}

function EnumProbabilityText<EnumType extends number | string>(props: Props<EnumType>) {
    const classes = useStyles();

    const invalid = useRef<EnumType | null>(null);

    var pureProbs = props.probs ? props.probs.toMap() : new Map<EnumType, number>();
    var isDefaultChecked = props.probs === null;

    const handleProbabilityChange = (enumChanged: EnumType, newValue: number) => {
        if (newValue < 0 || newValue > 100) {
            return;
        }
        if (Number.isNaN(newValue)) {
            newValue = 0;
            invalid.current = enumChanged;
        } else {
            newValue = newValue/100;
            invalid.current = null;
        }
        pureProbs.set(enumChanged, parseFloat(newValue.toFixed(4)));
        var newList = new Probabilities<EnumType>(pureProbs, false);
        
        props.onProbUpdate!(newList);
    }

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            props.onProbUpdate(null);
        } else {
            props.onProbUpdate(Probabilities.buildUniform(Object.values(props.enum)));
        }
    }

    const handleBlur = (e: EnumType) => {
        if (e === invalid.current) {
            pureProbs.set(e, 0);
            var newList = new Probabilities<EnumType>(pureProbs, false);
            invalid.current = null;
            props.onProbUpdate!(newList);
        }
    }

    return (
        <Grid
            container
            wrap="nowrap"
            direction="row"
            alignItems="center"
        >
            <FormControl className={classes.label} disabled={props.disabled|| isDefaultChecked}>
                <FormLabel>{props.label}</FormLabel>
            </FormControl>
            {Object.values(props.enum).map((x: EnumType, i: number) =>
                    <FormControl key={x} disabled={props.disabled || isDefaultChecked} fullWidth className={classes.margin} variant="outlined">
                        <InputLabel htmlFor={"enum-prob-input-" + i}>{x}</InputLabel>
                        <OutlinedInput
                            onBlur={()=>handleBlur(x)}
                            id={"enum-prob-input-" + i}
                            type="number"
                            value={isDefaultChecked ? "" : invalid.current === x ? "" : +(pureProbs.get(x)!*100).toFixed(2)}
                            onChange={(e)=>handleProbabilityChange(x, parseFloat(e.target.value))}
                            endAdornment={<InputAdornment position="end">%</InputAdornment>}
                            inputProps={{ inputprops: { min: "0", max: "100", step: "1" },  style: { textAlign: "right" } }}
                            labelWidth={x.toString().length*9}
                        />
                    </FormControl>
            )}
            <FormControlLabel
                disabled={props.disabled}
                control={
                <Checkbox
                    checked={isDefaultChecked}
                    onChange={handleCheckboxChange}
                    name="useDefault"
                    color="default"
                />
                }
                label="Use Default"
            />
        </Grid>
    );
    
}

export default EnumProbabilityText;