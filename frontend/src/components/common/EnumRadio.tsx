import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

type Props<EnumType extends number | string> = {
    label: string;
    value: EnumType;
    enum: {[s: string]: EnumType};
    onChange: (value: EnumType) => void;
};

function EnumRadio<EnumType extends number | string>(props: Props<EnumType>) {
    return (
        <FormControl>
            <FormLabel component="legend">{props.label}</FormLabel>
            <RadioGroup row value={props.value} onChange={(e)=>props.onChange(e.target.value as EnumType)}>
                {Object.values(props.enum).map(x =>
                    <FormControlLabel key={x} value={x} control={<Radio size='small'/>} label={x} />
                )}
            </RadioGroup>
        </FormControl>
    );
    
}

export default EnumRadio;