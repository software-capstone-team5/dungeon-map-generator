import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

type Props<EnumType extends number | string> = {
    disabled?: boolean;
    label: string;
    value: EnumType;
    enum: {[s: string]: EnumType};
    onChange: (value: EnumType) => void;
};

EnumRadio.defaultProps = {
    disabled: false
}

function EnumRadio<EnumType extends number | string>(props: Props<EnumType>) {
    return (
        <FormControl disabled={props.disabled}>
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