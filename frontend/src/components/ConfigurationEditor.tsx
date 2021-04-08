import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import { Button, Typography, AccordionDetails, TextField, Paper } from '@material-ui/core';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { nameOf, valueOf } from '../utils/util';
import { Configuration } from '../models/Configuration';
import MapLevelConfiguration from './MapLevelConfiguration';
import RegionLevelConfiguration from './RegionLevelConfiguration';
import { DB } from '../DB';

import cloneDeep from 'lodash/cloneDeep';
import { RoomCategory } from '../models/RoomCategory';
import { CorridorCategory } from '../models/CorridorCategory';

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
            this.state = { configuration: cloneDeep(props.configuration) };
        } else {
            // This is just temporary test data
            var config = new Configuration();
            var rc1 = new CorridorCategory();
            rc1.id = "1"
            rc1.name = "Windy Hall";
            var rc2 = new CorridorCategory();
            rc2.id = "2"
            rc2.name = "Big Boy Hall";
            config.corridorCategories.add(rc1, 0.5);
            config.corridorCategories.add(rc2, 0.5);

            var rrc1 = new RoomCategory();
            rrc1.id = "1"
            rrc1.name = "Prison Room";
            var rrc2 = new RoomCategory();
            rrc2.id = "2"
            rrc2.name = "Treasure Room";
            config.roomCategories.add(rrc1, 0.5);
            config.roomCategories.add(rrc2, 0.5);
            this.state = { configuration: config };
            // this.state = {configuration: new Configuration()};
        }

        // This binding is necessary to make `this` work in the callback
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    // REQ-18: Save.MapConfiguration - The system allows logged -in users to save the entire map configuration(both Map Level and Region Level) as a Preset.
    async handleSave() {
        // TODO Display error/success message?
        var result = await DB.saveConfig(this.state.configuration);
        if (result.valid) {
            var id = result.response;
            this.state.configuration.id = id;
        } else {
            window.alert(result.response)
        }
    }

    handleChange(name: keyof Configuration, value: valueOf<Configuration>) {
        this.setState(prevState => ({ configuration: Object.assign({}, prevState.configuration, { [name]: value }) }));
    }

    render() {
        return (
            <div>
                <Typography variant="h5" gutterBottom>Configuration</Typography>
                <Paper>
                    <TextField
                        variant="outlined"
                        margin="dense"
                        label="Name"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={this.state.configuration.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.handleChange(nameOf<Configuration>("name"), e.target.value)}
                    />
                    <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography>Map Level Options</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <MapLevelConfiguration configuration={this.state.configuration} onChange={this.handleChange} />
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
                            <RegionLevelConfiguration configuration={this.state.configuration} onChange={this.handleChange} />
                        </AccordionDetails>
                    </Accordion>
                </Paper>
                <Button variant="contained">Generate</Button>
                <Button onClick={this.handleSave} variant="contained">Save</Button>
            </div>
        );
    }
}

export default ConfigurationEditor;