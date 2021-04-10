import React, { useEffect, useState } from 'react';

import { makeStyles, Theme, withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import Tooltip from '@material-ui/core/Tooltip';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

import { nameOf, valueOf } from '../utils/util';
import { Configuration } from '../models/Configuration';
import MapLevelConfiguration from './MapLevelConfiguration';
import RegionLevelConfiguration from './RegionLevelConfiguration';
import NameUpdate from './NameUpdate';
import { DB } from '../DB';
import Authenticator from '../Authenticator';

import cloneDeep from 'lodash/cloneDeep';

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

function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) =>  ({
    helpIcon: {
      "padding-left": theme.spacing(1),
      "padding-right": theme.spacing(1)
    },
    customWidth: {
      maxWidth: 200,
    },
    button: {
        padding: theme.spacing(2),
    }
}));


type Props = {
    configuration?: Configuration;
}

function ConfigurationEditor(props: Props) {
    const classes = useStyles();

    const [successAlert, setSuccessAlert] = useState(false);
    const [showNameUpdate, setShowNameUpdate] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [viewMode, setViewMode] = useState(() => {
        return false;
        // if (props.configuration.default) {
        //     return true;
        // } else {
        //     return false
        // }
    });
    const [configuration, setConfiguration] = useState<Configuration>(() => {
        if (props.configuration !== undefined) {
            return cloneDeep(props.configuration);
        } else {
            return new Configuration();
        }
    });

    const disabled = isSaving || viewMode;

    useEffect(() => {
        if (props.configuration !== undefined) {
            setConfiguration(cloneDeep(props.configuration));
        } else {
            setConfiguration(new Configuration());
        }
    }, [props.configuration])

    const handleChange = (name: keyof Configuration, value: valueOf<Configuration>) => {
        setConfiguration(Object.assign(Object.create(configuration), configuration, {[name]: value}))
    }

    // REQ-18: Save.MapConfiguration - The system allows logged -in users to save the entire map configuration(both Map Level and Region Level) as a Preset.
    const handleSave = async (name: string) => {
        var configToSave = Object.assign({}, configuration, {name: name});
        configToSave.roomCategories.normalize();
        configToSave.corridorCategories.normalize();

        if (Authenticator.isLoggedIn()) {
            setIsSaving(true);
            var result = await DB.saveConfig(configToSave);
            if (result && result.valid) {
                var id = result.response;
                configToSave.id = id;
                setConfiguration(configToSave);
                setSuccessAlert(true);
            } else {
                window.alert(result.response)
            }
            setIsSaving(false);
        }
    }

    const handleSaveClick = () => {
        setShowNameUpdate(true);
    }

    const handleGenerate = () => {
        // configuration.roomCategories.normalize();
        // configuration.corridorCategories.normalize();
        // TODO: Generate
    }

    const handleAlertClose = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
          return;
        }
        setSuccessAlert(false);
    };

    const handleNameConfirm = (name: string) => {
        setShowNameUpdate(false);
        handleSave(name);
    }

    return (
        <div>
            {showNameUpdate &&
                <NameUpdate
                    oldName={configuration.name}
                    open={showNameUpdate}
                    onNameConfirm={handleNameConfirm}
                    onCancel={() => setShowNameUpdate(false)}
                />
            }
            <Snackbar open={successAlert} autoHideDuration={6000} onClose={handleAlertClose}>
                <Alert onClose={handleAlertClose} severity="success">
                    Configuration saved!
                </Alert>
            </Snackbar>
            <Paper>
                {configuration.name &&
                    <Accordion expanded={true}>
                    <AccordionSummary
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography>Name</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <TextField
                            disabled
                            variant="outlined"
                            margin="dense"
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={configuration.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>)=>handleChange(nameOf<Configuration>("name"), e.target.value)}
                        />
                    </AccordionDetails>
                    </Accordion>
                }
                
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
            <Grid container direction="row" justify="center">
                <div className={classes.button}>
                <Button disabled={isSaving} onClick={handleGenerate} variant="contained" color="secondary">Generate</Button>
                </div>
                <div className={classes.button}>
                <Button onClick={handleSaveClick} variant="contained" color="primary" disabled={!Authenticator.isLoggedIn() || disabled}>Save</Button>
                </div>
            </Grid>
            
        </div>
    );
}

export default ConfigurationEditor;