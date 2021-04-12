import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import { makeStyles, Theme, withStyles } from '@material-ui/core/styles';
import MuiAlert, { AlertProps, Color } from '@material-ui/lab/Alert';
import cloneDeep from 'lodash/cloneDeep';
import React, { useEffect, useState } from 'react';
import { DungeonMap } from '../models/DungeonMap';
import { valueOf } from '../utils/util';
import DownloadDungeon from './DownloadDungeon';


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

const useStyles = makeStyles((theme) => ({
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
    map: DungeonMap | null;
	getSingleImage: () => Map<string, any>;
	getMultipleImages: () => Map<string, any>;
}

function DungeonEditor(props: Props) {
    const classes = useStyles();

    const [alert, setAlert] = useState({
        message: "",
        severity: "success",
        active: false,
    });
    const [isDownloading, setIsDownloading] = useState(false);
    const [viewMode, setViewMode] = useState(() => {
        return false;
        // if (props.configuration.default) {
        //     return true;
        // } else {
        //     return false
        // }
    });
    const [map, setMap] = useState<DungeonMap | null>(() => {
        if (props.map) {
            return cloneDeep(props.map);
        } else {
            return null;
        }
    });

    useEffect(() => {
        if (props.map) {
            setMap(cloneDeep(props.map));
        } else {
            setMap(null);
        }
    }, [props.map])

    const handleChange = (name: keyof DungeonMap, value: valueOf<DungeonMap>) => {
        setMap(Object.assign(Object.create(Object.getPrototypeOf(map)), map, { [name]: value }))
    }

	const handleDownload = async (valid: boolean, result: string | null) => {
		setIsDownloading(false);
    }

	const handleDownloadClick = () => {
		setIsDownloading(true);
	}

	const handleApplyClick = () => {
		//TODO
	}
	
    const handleAlertClose = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setAlert({ ...alert, active: false });
    };

    return (
        <div>
			{map &&
               <div>
			   <Snackbar open={alert.active} autoHideDuration={6000} onClose={handleAlertClose}>
				   <Alert onClose={handleAlertClose} severity={alert.severity as Color}>
					   {alert.message}
				   </Alert>
			   </Snackbar>
			   <DownloadDungeon open={isDownloading} map={map} getSingleImage={props.getSingleImage} getMultipleImages={props.getMultipleImages} onDownload={handleDownload} onCancel={() => handleDownload(true, null)}/>
			   <Paper>
				   {/* <Accordion expanded={true}>
				   </Accordion> */}
			   </Paper>
			   <Grid container direction="row" justify="center">
				   <div className={classes.button}>
					   <Button disabled={isDownloading} onClick={handleApplyClick} variant="contained" color="secondary">Apply Changes</Button>
				   </div>
				   <div className={classes.button}>
					   <Button disabled={isDownloading} onClick={handleDownloadClick} variant="contained" color="primary">Download</Button>
				   </div>
			   </Grid>
		   </div>
            }
        </div>
    );
}

export default DungeonEditor;