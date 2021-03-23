import React from 'react';
import {Radio, RadioGroup, FormControlLabel, FormControl, FormLabel} from '@material-ui/core';

enum Size {
	small = "SMALL",
	medium = "MEDIUM",
	large = "LARGE"
}

type Props = {
    label: string;
};

type State = {
    size: Size;
};

class SizeRadio extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {size: Size.small};
    
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            size: event.target.value as Size
        })
    }

    render() {
        return (
            <FormControl component="fieldset">
                <FormLabel component="legend">{this.props.label}</FormLabel>
                <RadioGroup row aria-label="size" name="size" value={this.state.size} onChange={this.handleChange}>
                    {Object.values(Size).map(x =>
                        <FormControlLabel key={x} value={x} control={<Radio />} label={x} />
                    )}
                </RadioGroup>
            </FormControl>
        );
    }
}

export default SizeRadio;