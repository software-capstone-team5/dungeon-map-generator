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
import DownloadDungeon from './DownloadDungeon';
import DifficultySlider from './DifficultySlider';
import Typography from '@material-ui/core/Typography';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import { DungeonGenerator } from '../generator/DungeonGenerator';
import RegionLevelConfiguration from './RegionLevelConfiguration';
import { Configuration } from '../models/Configuration';
import { valueOf } from '../utils/util';
import { RegionCategory } from '../models/RegionCategory';
import ConfirmChange from './ConfirmChange';
import RegionLevelModify from './RegionLevelModify';

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
			flexGrow: 0
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
    button: {
        padding: theme.spacing(2),
    }
}));

type Props = {
    map: DungeonMap | null;
	onChange: (map: DungeonMap) => void;
	getSingleImage: () => Map<string, any>;
	getMultipleImages: () => Map<string, any>;
	selectCategory: (category: RegionCategory) => void;
}

function DungeonEditor(props: Props) {
	const [changes, setChanges] = useState(() => {
		return {} as any;
	});
	const [regionChanges, setRegionChanges] = useState(() => {
		return {} as any;
	});
    const classes = useStyles();

    const [alert, setAlert] = useState({
        message: "",
        severity: "success",
        active: false,
    });
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirmMessage, setConfirmMessage] = useState("");
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

	const handleDownloadComplete = async (valid: boolean, result: string | null) => {
		setIsDownloading(false);
    }

	const handleDownloadClick = () => {
		setIsDownloading(true);
	}

	const handleApplyClick = () => {
		if (map && map.config){
			var newMap = Object.create(Object.getPrototypeOf(map));
			Object.assign(newMap, map);

			if (changes.difficulty != map.config.difficulty) {
				DungeonGenerator.generateEncounters(newMap, newMap.config);
			}

			setMap(newMap);
			props.onChange(newMap);
		}
	}
	
    const handleAlertClose = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setAlert({ ...alert, active: false });
    };

	const handleDifficultyChange = (difficulty: number) => {
		var newChanges = {} as any;
		Object.assign(newChanges, changes);
		newChanges.difficulty = difficulty;
		setChanges(newChanges);
	}

	const handleRegionChanges = (name: keyof Configuration, value: valueOf<Configuration>) => {
		var newChanges = {} as any;
		Object.assign(newChanges, regionChanges,  { [name]: value });
		setRegionChanges(newChanges);
	}

	const handleConfirmDecision = (decision: boolean) => {
		if (decision) {
			// TODO
		}
		
		setRegionChanges({} as any);
	}

    return (
        <div>
			{map && map.config && <div>
			   <Snackbar open={alert.active} autoHideDuration={6000} onClose={handleAlertClose}>
				   <Alert onClose={handleAlertClose} severity={alert.severity as Color}>
					   {alert.message}
				   </Alert>
			   </Snackbar>
			   <DownloadDungeon open={isDownloading} map={map} getSingleImage={props.getSingleImage} getMultipleImages={props.getMultipleImages} onDownload={handleDownloadComplete} onCancel={() => handleDownloadComplete(true, null)}/>
			   <Paper>
					<Accordion expanded={true}>
						<AccordionSummary
							aria-controls="panel1a-content"
							id="panel1a-header">
							<Typography>Map Level Options</Typography>
						</AccordionSummary>
						<AccordionDetails>
								<DifficultySlider
									disabled={isDownloading}
									onChange={handleDifficultyChange}
									value={changes.difficulty ? changes.difficulty : map.config.difficulty}/>
						</AccordionDetails>
					</Accordion>
					<Accordion expanded={true}>
						<AccordionSummary
							aria-controls="panel2a-content"
							id="panel2a-header">
							<Typography>Region Level Options</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<RegionLevelModify isSaving={isDownloading} configuration={map.config} onChange={handleRegionChanges} selectCategory={props.selectCategory} savePhrase={"Apply"}/>
						</AccordionDetails>
					</Accordion>
			   </Paper>
			   <Grid container direction="row" justify="center">
				   <div className={classes.button}>
					   <Button disabled={isDownloading} onClick={handleApplyClick} variant="contained" color="secondary">Apply Changes</Button>
				   </div>
				   <div className={classes.button}>
					   <Button disabled={isDownloading} onClick={handleDownloadClick} variant="contained" color="primary">Download</Button>
				   </div>
			   </Grid>
		   </div>}
		   {confirmOpen && 
				<ConfirmChange
					open={confirmOpen}
					message={confirmMessage}
					onDecision={handleConfirmDecision}/>}
        </div>
    );
}

export default DungeonEditor;