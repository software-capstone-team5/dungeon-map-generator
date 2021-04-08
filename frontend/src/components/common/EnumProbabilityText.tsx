import {FormControl, FormLabel, InputLabel, Input, InputAdornment, makeStyles} from '@material-ui/core';
import { createNumericLiteral } from 'typescript';
import { Probabilities } from '../../generator/Probabilities';

type Props<EnumType extends number | string> = {
    disabled?: boolean;
    label: string;
    probs: Probabilities<EnumType>;
    enum: {[s: string]: EnumType};
    onProbUpdate: (newList: Probabilities<EnumType>) => void;
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
    var pureProbs = props.probs.toMap();

    const handleProbabilityChange = (enumChanged: EnumType, newValue: number) => {
        if (newValue < 0 || newValue > 100 || Number.isNaN(newValue)) {
            return;
        }
        newValue = newValue/100
        pureProbs.set(enumChanged, parseFloat(newValue.toFixed(4)));
        var newList = new Probabilities<EnumType>(pureProbs, false);
        
        props.onProbUpdate!(newList);
    }

    return (
        <div className={classes.root}>
            <FormLabel>{props.label}</FormLabel>
            {Object.values(props.enum).map((x: EnumType, i: number) =>
                    <FormControl key={x} disabled={props.disabled} fullWidth className={classes.margin}>
                        <InputLabel>{x}</InputLabel>
                        <Input
                            type="number"
                            value={+(pureProbs.get(x)!*100).toFixed(2)}
                            onChange={(e)=>handleProbabilityChange(x, parseFloat(e.target.value))}
                            endAdornment={<InputAdornment position="end">%</InputAdornment>}
                            inputProps={{ inputprops: { min: "0", max: "100", step: "1" },  style: { textAlign: "right" } }}
                        />
                    </FormControl>
            )}
        </div>
    );
    
}

export default EnumProbabilityText;