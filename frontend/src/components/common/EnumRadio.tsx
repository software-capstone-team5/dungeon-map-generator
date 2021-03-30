import {Radio, RadioGroup, FormControlLabel, FormControl, FormLabel} from '@material-ui/core';

type Props<EnumType extends number | string> = {
    label: string;
    initialValue: EnumType;
    callbackPropertyName: string;
    enum: {[s: string]: EnumType};
    onChange: (name: string, value: EnumType) => void;
};

function EnumRadio<EnumType extends number | string>(props: Props<EnumType>) {
    return (
        <FormControl component="fieldset">
            <FormLabel component="legend">{props.label}</FormLabel>
            <RadioGroup row defaultValue={props.initialValue} onChange={(e)=>props.onChange(props.callbackPropertyName, e.target.value as EnumType)}>
                {Object.values(props.enum).map(x =>
                    <FormControlLabel key={x} value={x} control={<Radio size='small'/>} label={x} />
                )}
            </RadioGroup>
        </FormControl>
    );
    
}

export default EnumRadio;