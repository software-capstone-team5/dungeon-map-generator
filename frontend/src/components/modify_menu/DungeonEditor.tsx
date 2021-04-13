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
import { DungeonMap } from '../../models/DungeonMap';
import DownloadDungeon from './DownloadDungeon';
import DifficultySlider from '../DifficultySlider';
import Typography from '@material-ui/core/Typography';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import { DungeonGenerator } from '../../generator/DungeonGenerator';
import { Configuration } from '../../models/Configuration';
import { nameOf, valueOf } from '../../utils/util';
import { RegionCategory } from '../../models/RegionCategory';
import ConfirmChange from './ConfirmChange';
import RegionCategoryModify from './RegionCategoryModify';
import lodash from 'lodash';
import { RoomInstance } from '../../models/RoomInstance';
import { RoomCategory } from '../../models/RoomCategory';
import { CorridorInstance } from '../../models/CorridorInstance';
import { Probabilities } from '../../generator/Probabilities';
import RegionInstanceModify from './RegionInstanceModify';
import { RegionInstance } from '../../models/RegionInstance';

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
	selectedRoomIndex?: number;
	selectedCorridorIndex?: number;
	selectedRoomCategoryIndex?: number;
	selectedCorridorCategoryIndex?: number;
	onChange: (map: DungeonMap) => void;
	onAddRegion: (category: RegionCategory) => void;
	getSingleImage: () => Map<string, any>;
	getMultipleImages: () => Map<string, any>;
	selectCategory: (category: RegionCategory) => void;
	selectInstance: (instance: RegionInstance) => void;
}

function DungeonEditor(props: Props) {
	const [changes, setChanges] = useState(() => {
		return {} as any;
	});
	const [regionChanges, setRegionChanges] = useState(() => {
		return {} as any;
	});
	const [regionInstanceChanges, setRegionInstanceChanges] = useState(() => {
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
	const [confirmArgs, setConfirmArgs] = useState({name: "" as any, index: 0});
	const [confirmFunction, setConfirmFunction] = useState<(decision: boolean, args: {name: any, index: number}) => void>();
    const [isDownloading, setIsDownloading] = useState(false);
    const [map, setMap] = useState<DungeonMap | null>(null);

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

			if (changes.difficulty !== map.config.difficulty) {
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

	const handleRegionInstanceChanges = (name: keyof DungeonMap, value: valueOf<DungeonMap>) => {
		var newChanges = {} as any;
		Object.assign(newChanges, regionInstanceChanges,  { [name]: value });
		setRegionInstanceChanges(newChanges);
	}

	const handleRegenerateInstanceClick = (name: keyof DungeonMap, index: number) => {
		if (name as keyof DungeonMap){
			setConfirmFunction(() => confirmInstanceRegenerate);
			setConfirmMessage("Are you sure you would like to regenerate the contents of this region?");
			setConfirmArgs({name: name, index: index})
			setConfirmOpen(true);
		}
	}

	const handleRegenerateClick = (name: keyof Configuration, index: number) => {
		if (name as keyof Configuration){
			setConfirmFunction(() => confirmRegenerate);
			setConfirmMessage("Are you sure you would like to regenerate the contents of all of the regions with this category?");
			setConfirmArgs({name: name, index: index})
			setConfirmOpen(true);
		}
	}

	const handleAddCategoriesClick = (name: keyof Configuration, index: number) => {
		if (name as keyof Configuration && map){
			setAlert({ message: "Click anywhere on the map to add a room. The entrance will be at the clicked location.", active: true, severity: "success" });
			var category = null;
			if (name === nameOf<Configuration>("roomCategories")){
				category = map.config.roomCategories.objects[index];
			}
			else{
				category = map.config.corridorCategories.objects[index];
			}

			if (category && props.onAddRegion){
				props.onAddRegion(category)
			}
		}
	}

	const handleRegionInstanceDelete = (name: keyof DungeonMap, index: number) => {
		if (name as keyof DungeonMap){
			setConfirmFunction(() => confirmInstanceDelete);
			setConfirmMessage("Are you sure you would like to delete this region?");
			setConfirmArgs({name: name, index: index})
			setConfirmOpen(true);
		}
	}

	const confirmInstanceDelete = (decision: boolean, args: {name: any, index: number}) => {
		var name = args.name as keyof DungeonMap
		if (decision && name){
			var newMap = Object.create(Object.getPrototypeOf(map)) as DungeonMap;
			Object.assign(newMap, map);
			if (name === nameOf<DungeonMap>("rooms")){
				newMap.removeRoom(newMap.rooms[args.index]);
			}
			else{
				newMap.removeCorridor(newMap.corridors[args.index]);
			}
			props.onChange(newMap);
		}
		setConfirmOpen(false);
	}

	const confirmInstanceRegenerate = (decision: boolean, args: {name: any, index: number}) => {
		var name = args.name as keyof DungeonMap
		if (decision && name){
			var newMap = Object.create(Object.getPrototypeOf(map)) as DungeonMap;
			Object.assign(newMap, map);
			if (name === nameOf<DungeonMap>("rooms")){
				var room = newMap.rooms[args.index];
				newMap.rooms[args.index] = Object.assign(room, DungeonGenerator.regenerateRegion(room, room.category, newMap.config));
			}
			else{
				var corridor = newMap.corridors[args.index];
				newMap.corridors[args.index] = Object.assign(corridor, DungeonGenerator.regenerateRegion(corridor, corridor.category, newMap.config));
			}
			props.onChange(newMap);
		}
		setConfirmOpen(false);
	}

	const confirmRegenerate = (decision: boolean, args: {name: any, index: number}) => {
		var name = args.name as keyof Configuration
		if (decision && name){
			var newMap = Object.create(Object.getPrototypeOf(map)) as DungeonMap;
			Object.assign(newMap, map);
			if (args.name === nameOf<Configuration>("roomCategories")){
				var category = (newMap.config[name] as Probabilities<RoomCategory>).objects[args.index];
				newMap.rooms.forEach((room: RoomInstance, index: number) => {
					if (lodash.isEqual(room.category, category)){
						newMap.rooms[index] = Object.assign(room, DungeonGenerator.regenerateRegion(room, category, newMap.config));
					}
				});
			}
			else{
				var category = (newMap.config[name] as Probabilities<RoomCategory>).objects[args.index];
				newMap.corridors.forEach((corridor: CorridorInstance, index: number) => {
					if (lodash.isEqual(corridor.category, category)){
						newMap.corridors[index] = Object.assign(corridor, DungeonGenerator.regenerateRegion(corridor, category, newMap.config));
					}
				});
			}
			props.onChange(newMap);
		}
		setConfirmOpen(false);
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
							<Typography>Region Category Options</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<RegionCategoryModify 
								isSaving={isDownloading} 
								savePhrase={"Apply"}
								configuration={map.config} 
								selectedRoomCategoryIndex={props.selectedRoomCategoryIndex}
								selectedCorridorCategoryIndex={props.selectedCorridorCategoryIndex}
								onChange={handleRegionChanges}
								onRegenerateClick={handleRegenerateClick}
								onAddClick={handleAddCategoriesClick}
								selectCategory={props.selectCategory} />
						</AccordionDetails>
					</Accordion>
					<Accordion expanded={true}>
						<AccordionSummary
							aria-controls="panel2a-content"
							id="panel2a-header">
							<Typography>Region Instance Options</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<RegionInstanceModify 
								isSaving={isDownloading} 
								savePhrase={"Apply"}
								map={map}
								selectedRoomIndex={props.selectedRoomIndex}
								selectedCorridorIndex={props.selectedCorridorIndex}
								onChange={handleRegionInstanceChanges}
								onRegenerateClick={handleRegenerateInstanceClick} 
								onDeleteClick={handleRegionInstanceDelete}
								selectInstance={props.selectInstance}/>
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
					args={confirmArgs}
					onDecision={confirmFunction}/>
			}
        </div>
    );
}

export default DungeonEditor;