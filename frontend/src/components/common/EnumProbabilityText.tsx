import {FormControl, FormLabel, InputLabel, Input, InputAdornment, makeStyles} from '@material-ui/core';
import { Probabilities } from '../../generator/Probabilities';

type Props<EnumType extends number | string> = {
    disabled?: boolean;
    label: string;
    probs: Probabilities<EnumType>;
    enum: {[s: string]: EnumType};
    onProbUpdate: (enumChanged: EnumType, newValue: number) => void;
};

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'flex-end',
    },
    margin: {
      margin: theme.spacing(1),
    },
}));

EnumProbabilityText.defaultProps = {
    disabled: false
}

function EnumProbabilityText<EnumType extends number | string>(props: Props<EnumType>) {
    const classes = useStyles();

    const handleProbabilityChange = (enumChanged: EnumType, newValue: number) => {
        if (newValue < 0 || newValue > 100) {
          return;
        }
        // TODO: How do we handle non-normalized inputs?
        props.onProbUpdate(enumChanged, newValue/100)
    }

    return (
        <div className={classes.root}>
            <FormLabel>{props.label}</FormLabel>
            {Object.values(props.enum).map((x: EnumType, i: number) =>
                <div>
                    <FormControl disabled={props.disabled} fullWidth className={classes.margin}>
                        <InputLabel>{x}</InputLabel>
                        <Input
                            type="number"
                            value={props.probs.probSum[i]*100}
                            onChange={(e)=>handleProbabilityChange(x, parseFloat(e.target.value))}
                            endAdornment={<InputAdornment position="end">%</InputAdornment>}
                            inputProps={{ inputProps: { min: "0", max: "100", step: "1" },  style: { textAlign: "right" } }}
                        />
                    </FormControl>
                </div>
            )}
        </div>
    );
    
}

export default EnumProbabilityText;