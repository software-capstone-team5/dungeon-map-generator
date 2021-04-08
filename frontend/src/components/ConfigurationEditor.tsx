import React, { useEffect, useState } from 'react';

import { makeStyles, Theme, withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import { Tooltip } from '@material-ui/core';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

import {nameOf, valueOf} from '../utils/util';
import {Configuration} from '../models/Configuration';
import MapLevelConfiguration from './MapLevelConfiguration';
import RegionLevelConfiguration from './RegionLevelConfiguration';

import cloneDeep from 'lodash/cloneDeep';
import { RoomCategory } from '../models/RoomCategory';
import { CorridorCategory } from '../models/CorridorCategory';
import { Monster } from '../models/Monster';

const styles = (theme: Theme) => ({
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
});
const AccordionSummary = withStyles(styles)(MuiAccordionSummary);

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

const useStyles = makeStyles((theme) =>  ({
    helpIcon: {
      "padding-left": theme.spacing(1),
      "padding-right": theme.spacing(1)
    },
    customWidth: {
      maxWidth: 200,
    }
}));


type Props = {
    configuration?: Configuration;
}

function ConfigurationEditor(props: Props) {
    const classes = useStyles();

    const [configuration, setConfiguration] = useState<Configuration>(() => {
        if (props.configuration !== undefined) {
            return cloneDeep(props.configuration);
        } else {
            return new Configuration();
        }
    });

    const handleSave = () => {
        // configuration.roomCategories.normalize();
        // configuration.corridorCategories.normalize();
        // TODO: Take configuration and send it to the backend
    }

    const handleChange = (name: keyof Configuration, value: valueOf<Configuration>) => {
        setConfiguration(Object.assign({}, configuration, {[name]: value}))
    }

    const handleGenerate = () => {
        // configuration.roomCategories.normalize();
        // configuration.corridorCategories.normalize();
        // TODO: Generate
    }

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
                    value={configuration.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>handleChange(nameOf<Configuration>("name"), e.target.value)}
                />
                <Accordion expanded={true}>
                    <AccordionSummary
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography>Map Level Options</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <MapLevelConfiguration configuration={configuration} onChange={handleChange}/>
                    </AccordionDetails>
                </Accordion>
                <Accordion expanded={true}>
                    <AccordionSummary
                        aria-controls="panel2a-content"
                        id="panel2a-header"
                    >
                        <Typography>Region Level Options</Typography>
                        <Tooltip title="The probabilities in each list will be normalized if they don't sum up to 100%" classes={{ tooltip: classes.customWidth }}>
                            <HelpOutlineIcon className={classes.helpIcon} color="primary"></HelpOutlineIcon>
                        </Tooltip>
                    </AccordionSummary>
                    <AccordionDetails>
                        <RegionLevelConfiguration configuration={configuration} onChange={handleChange}/>
                    </AccordionDetails>
                </Accordion>
            </Paper>
            <Button onClick={handleGenerate} variant="contained">Generate</Button>
            <Button onClick={handleSave} variant="contained">Save</Button>
        </div>
    );
}

export default ConfigurationEditor;