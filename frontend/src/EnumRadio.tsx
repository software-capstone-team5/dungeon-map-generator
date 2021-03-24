import React from 'react';
import {Radio, RadioGroup, FormControlLabel, FormControl, FormLabel} from '@material-ui/core';

type Props<EnumType extends number | string> = {
    label: string;
    enum: {[s: string]: EnumType};
    onChange: (newValue: EnumType) => void;
};

type State<EnumType extends number | string> = {
    value: EnumType;
};

class EnumRadio<EnumType extends number | string> extends React.Component<Props<EnumType>, State<EnumType>> {

    constructor(props: Props<EnumType>) {
        super(props);
        this.state = {value: Object.values(props.enum)[0]};
    
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            value: event.target.value as EnumType
        });
        this.props.onChange(this.state.value);
    }

    render() {
        return (
            <FormControl component="fieldset">
                <FormLabel component="legend">{this.props.label}</FormLabel>
                <RadioGroup row value={this.state.value} onChange={this.handleChange}>
                    {Object.values(this.props.enum).map(x =>
                        <FormControlLabel key={x} value={x} control={<Radio />} label={x} />
                    )}
                </RadioGroup>
            </FormControl>
        );
    }
}

export default EnumRadio;