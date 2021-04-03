import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import { Button, Typography, AccordionDetails } from '@material-ui/core';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import {valueOf} from '../utils/util';
import {Configuration} from '../models/Configuration';
import MapLevelConfiguration from './MapLevelConfiguration';
import RegionLevelConfiguration from './RegionLevelConfiguration';


const AccordionSummary = withStyles({
    root: {
      backgroundColor: 'rgba(0, 0, 0, .03)',
      borderBottom: '1px solid rgba(0, 0, 0, .125)',
      marginBottom: -1,
      minHeight: 56,
      '&$expanded': {
        minHeight: 56,
      },
    },
    content: {
      '&$expanded': {
        margin: '12px 0',
      },
    },
    expanded: {},
  })(MuiAccordionSummary);

const Accordion = withStyles({
root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:before': {
    display: 'none',
    },
    '&$expanded': {
    margin: 'auto',
    },
},
expanded: {},
})(MuiAccordion);


type Props = {
    configuration?: Configuration;
}

type State = {
    configuration: Configuration;
}

class ConfigurationEditor extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        if (props.configuration !== undefined) {
            this.state = {configuration: props.configuration};
        } else {
            this.state = {configuration: new Configuration()};
        }

        // This binding is necessary to make `this` work in the callback
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleSave() {
        // TODO Take this.state.configuration and send it to the backend
    }

    handleChange(name: keyof Configuration, value: valueOf<Configuration>) {
        this.setState(prevState => ({ configuration: Object.assign({}, prevState.configuration, { [name]: value }) }));
    }

    render() {
        return (
            <div>
                <form>
                    <Typography variant="h5" gutterBottom>Configuration</Typography>
                    <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography>Map Level Options</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <MapLevelConfiguration configuration={this.state.configuration} onChange={this.handleChange}/>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel2a-content"
                            id="panel2a-header"
                        >
                            <Typography>Region Level Options</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <RegionLevelConfiguration configuration={this.state.configuration} onChange={this.handleChange}/>
                        </AccordionDetails>
                    </Accordion>
                    <Button onClick={this.handleSave} variant="contained">Generate</Button>
                    <Button onClick={this.handleSave} variant="contained">Save</Button>
                </form>
            </div>
        );
    }
}

export default ConfigurationEditor;