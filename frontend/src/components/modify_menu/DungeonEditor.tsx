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
import { CorridorCategory } from '../../models/CorridorCategory';

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
	onAddEntrance: (region: RegionInstance) => void;
	getSingleImage: () => Map<string, any>;
	getMultipleImages: () => Map<string, any>;
	selectCategory: (category: RegionCategory) => void;
	selectInstance: (instance: RegionInstance) => void;
}

function DungeonEditor(props: Props) {
	const [changes, setChanges] = useState(() => {
		return {} as any;
	});
	const [regionCatChanges, setRegionChanges] = useState(() => {
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
	const [confirmPrompt, setConfirmPrompt] = useState("Confirm");
	const [confirmArgs, setConfirmArgs] = useState<any>({name: "" as any, index: 0});
	const [confirmFunction, setConfirmFunction] = useState<(decision: boolean, args: any) => void>();
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
				//TODO: Prompt user for generation
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

	const handleRegionCatChanges = (name: keyof Configuration, index:number, value: RegionCategory) => {
		if (map){
			var regionsToRegen: string[] = [];
			var originalCat: RoomCategory | CorridorCategory = name === nameOf<Configuration>("roomCategories") ? 
																map.config.roomCategories.objects[index] : 
																map.config.corridorCategories.objects[index];

			var encounterChanged = !lodash.isEqual(originalCat.monsters, value.monsters) || 
				!lodash.isEqual(originalCat.states, value.states) || 
				!lodash.isEqual(originalCat.traps, value.traps) ||
				!lodash.isEqual(originalCat.items, value.items) || 
				!lodash.isEqual(originalCat.tileSets, value.tileSets);

			if (name === nameOf<Configuration>("roomCategories")){
				originalCat = originalCat as RoomCategory;
				var newCat = (value as RoomCategory);
				var shapesChanged = !lodash.isEqual(originalCat.shapes, newCat.shapes);
				var sizesChanged = !lodash.isEqual(originalCat.sizes, newCat.sizes);
				if (sizesChanged || shapesChanged || encounterChanged){
					map.rooms.forEach((room) => {
						if (lodash.isEqual(room.category, originalCat) && (encounterChanged 
							|| (sizesChanged && (!newCat.sizes || newCat.sizes.getProb(room.size) <= 0)) 
							|| (shapesChanged && (!newCat.shapes || newCat.shapes.getProb(room.shape) <= 0)))){
								regionsToRegen.push(room.name);
						}
					})
				}
			}
			else {
				originalCat = originalCat as CorridorCategory;
				let newCat = (value as CorridorCategory);
				var widthsChanged = !lodash.isEqual(originalCat.widths, newCat.widths);
				if (widthsChanged || encounterChanged){
					map.corridors.forEach((corridor) => {
						if (lodash.isEqual(corridor.category, originalCat) && (encounterChanged 
							|| (widthsChanged && (!newCat.widths || newCat.widths.getProb(corridor.width) <= 0)))){
							regionsToRegen.push(corridor.name);
						}
					})
				}
			}

			if (regionsToRegen.length > 0){
				var regionNumbers = regionsToRegen.join(", ");

				setConfirmFunction(() => confirmRegionCatChanges);
				setConfirmMessage("Some of your changes will require some aspects of region(s) " + regionNumbers + " to be regenerated. Would you like to regenerate these rooms, or revert your changes?");
				setConfirmPrompt("Regenerate");
				setConfirmArgs({name: name, index: index, value: value});
				setConfirmOpen(true);
			}
		}
	}

	const confirmRegionCatChanges = (decision: boolean, args: {name: keyof Configuration, index:number, value: RegionCategory}) => {
		if (decision && map) {
			var newMap = Object.create(Object.getPrototypeOf(map));
			Object.assign(newMap, map);

			var originalCat: RoomCategory | CorridorCategory = args.name === nameOf<Configuration>("roomCategories") ? 
																map.config.roomCategories.objects[args.index] : 
																map.config.corridorCategories.objects[args.index];

			newMap.config[args.name].objects[args.index] = args.value;

			var encounterChanged = !lodash.isEqual(originalCat.monsters, args.value.monsters) || 
				!lodash.isEqual(originalCat.states, args.value.states) || 
				!lodash.isEqual(originalCat.traps, args.value.traps);
			var tileSetChanged = !lodash.isEqual(originalCat.tileSets, args.value.tileSets);
			var itemsChanged = !lodash.isEqual(originalCat.items, args.value.items);
			
			regionType = nameOf<DungeonMap>("corridors");
			if (args.name === nameOf<Configuration>("roomCategories")){
				var regionType = nameOf<DungeonMap>("rooms");
			}

			newMap[regionType].forEach((region: RegionInstance, index: number) => {
				var isSameCat = false;
				if (region.isCorridor){
					isSameCat = lodash.isEqual((region as CorridorInstance).category, originalCat);
					if (isSameCat){
						(region as CorridorInstance).category = (args.value as CorridorCategory);
					}
				}
				else{
					isSameCat = lodash.isEqual((region as RoomInstance).category, originalCat);
					if (isSameCat){
						(region as RoomInstance).category = (args.value as RoomCategory);
					}
				}
				if (isSameCat){
					if (encounterChanged){
						Object.assign(region, DungeonGenerator.genearteRegionEncounter(region, newMap.config, region.difficulty));
					}
					if (itemsChanged && (!args.value.items || region.items.find((item) => args.value.items!.getProb(item) <= 0))){
						Object.assign(region, DungeonGenerator.generateRegionItems(region, map.config, region.value));
					}
					if (tileSetChanged && (!args.value.tileSets || args.value.tileSets.getProb(region.tileSet) <= 0)){
						region.tileSet = args.value.tileSets ? args.value.tileSets.randPickOne() : newMap.config.defaultRoomCategory.tileSets.randPickOne();
					}
					newMap[regionType][index] = region;
				}
			})
			
			if (args.name === nameOf<Configuration>("roomCategories")){
				originalCat = originalCat as RoomCategory;
				let newCat = (args.value as RoomCategory);
				var shapesChanged = !lodash.isEqual(originalCat.shapes, newCat.shapes);
				var sizesChanged = !lodash.isEqual(originalCat.sizes, newCat.sizes);
				if (sizesChanged || shapesChanged || encounterChanged || tileSetChanged || itemsChanged){
					newMap.rooms.forEach((room: RoomInstance, index: number, array: RoomInstance[]) => {
						if (room.category === args.value){
							if ((sizesChanged && (!newCat.sizes || newCat.sizes.getProb(room.size) <= 0)) 
							|| (shapesChanged && (!newCat.shapes || newCat.shapes.getProb(room.shape) <= 0))){
								room = DungeonGenerator.regenerateRoomShapeFromCategory(room, newMap.config.defaultRoomCategory);
								DungeonGenerator.generateEntrancesForNeighbours(room, newMap);
							}
							newMap.updateRoom(index, room);
						}
					})
				}
			}
			else {
				regionType = nameOf<DungeonMap>("corridors")
				originalCat = originalCat as CorridorCategory;
				let newCat = (args.value as CorridorCategory);
				var widthsChanged = !lodash.isEqual(originalCat.widths, newCat.widths);
				if (widthsChanged){
					newMap.corridors.forEach((corridor: CorridorInstance, index: number, array: CorridorInstance[]) => {
						if (corridor.category === args.value){
							if ((widthsChanged && (!newCat.widths || newCat.widths.getProb(corridor.width) <= 0))){
								corridor = DungeonGenerator.regenerateCorridorShapeFromCategory(corridor, newMap.config.defaultRoomCategory);
								DungeonGenerator.generateEntrancesForNeighbours(corridor, newMap);
							}
							newMap.updateCorridor(index, corridor);
						}
					})
				}
			}
			
			setMap(newMap);
			props.onChange(newMap);
		}
		setConfirmOpen(false);
	}

	const confirmRegionInstanceChanges = (decision: boolean, args: {name: keyof DungeonMap, index:number, value: RegionInstance}) => {
		var newMap = Object.create(Object.getPrototypeOf(map));
		Object.assign(newMap, map);

		if (args.name === nameOf<DungeonMap>("rooms")){
			let original = newMap.rooms[args.index];
			var newRoom = (args.value as RoomInstance);
			if (!lodash.isEqual(original.shape, newRoom.shape) || !lodash.isEqual(original.size, newRoom.size)){
				newRoom = DungeonGenerator.regenerateRoomShape(newRoom);
				DungeonGenerator.generateEntrancesForNeighbours(newRoom, newMap);
			}
			newMap.updateRoom(args.index, newRoom);
		}
		else {
			let original = newMap.corridors[args.index];
			var newCorridor = (args.value as CorridorInstance);
			if (!lodash.isEqual(original.width, (args.value as CorridorInstance).width)){
				newCorridor = DungeonGenerator.regenerateCorridorShape(newCorridor);
				DungeonGenerator.generateEntrancesForNeighbours(newCorridor, newMap);
			}
			newMap.updateCorridor(args.index, newCorridor);
		}
		setMap(newMap);
		props.onChange(newMap);
		setConfirmOpen(false);
	}

	const handleRegionInstanceChanges = (name: keyof DungeonMap, index:number, value: RegionInstance) => {
		if (map){
			var original = name === nameOf<DungeonMap>("rooms") ? map.rooms[index] : map.corridors[index];

			var reloadRequired = !lodash.isEqual(original.tileSet, value.tileSet) || !lodash.isEqual(original.entrances, value.entrances);
			if (!reloadRequired){
				if (name === nameOf<DungeonMap>("rooms")){
					let originalInst = original as RoomInstance;
					var newRoom = (value as RoomInstance);
					if (!lodash.isEqual(originalInst.shape, newRoom.shape) || !lodash.isEqual(originalInst.size, newRoom.size)){
						reloadRequired = true;
					}
					else{
						var newMap = Object.create(Object.getPrototypeOf(map));
						Object.assign(newMap, map);
						newMap.updateRoom(index, value);
						setMap(newMap);
						props.onChange(newMap);
					}
				}
				else {
					if (!lodash.isEqual((original as CorridorInstance).width, (value as CorridorInstance).width)){
						reloadRequired = true;
					}
					else{
						var newMap = Object.create(Object.getPrototypeOf(map));
						Object.assign(newMap, map);
						newMap.updateCorridor(index, value);
						setMap(newMap);
						props.onChange(newMap);
					}
				}
			}

			if (reloadRequired){
				setConfirmFunction(() => confirmRegionInstanceChanges);
				setConfirmMessage("Some of your changes will require regenerating the way this room appears on the map. Would you like to regenerate this room, or revert your changes?");
				setConfirmPrompt("Regenerate");
				setConfirmArgs({name: name, index: index, value: value});
				setConfirmOpen(true);
			}
		}
	}

	const handleRegenerateInstanceClick = (name: keyof DungeonMap, index: number) => {
		if (name as keyof DungeonMap){
			confirmInstanceRegenerate(true, {name: name, index: index});
		// 	setConfirmFunction(() => );
		// 	setConfirmMessage("Are you sure you would like to regenerate the contents of this region?");
		// 	setConfirmArgs()
		// 	setConfirmOpen(true);
		}
	}

	const handleRegenerateClick = (name: keyof Configuration, index: number) => {
		if (name as keyof Configuration){
			confirmRegenerate(true, {name: name, index: index})
			// setConfirmFunction(() => confirmRegenerate);
			// setConfirmMessage("Are you sure you would like to regenerate the contents of all of the regions with this category?");
			// setConfirmArgs({name: name, index: index})
			// setConfirmOpen(true);
		}
	}

	const handleAddRegionClick = (name: keyof Configuration, index: number) => {
		if (map){
			var category = null;
			if (name === nameOf<Configuration>("roomCategories")){
				setAlert({ message: "Click anywhere on the map to add a room. There will be an entrance at the clicked location.", active: true, severity: "success" });
				category = map.config.roomCategories.objects[index];
			}
			else{
				setAlert({ message: "Click anywhere on the map to add the start and end of a corridor. There will be entrances at the two clicked locations.", active: true, severity: "success" });
				category = map.config.corridorCategories.objects[index];
			}

			if (category && props.onAddRegion){
				props.onAddRegion(category)
			}
		}
	}

	const handleAddEntranceClick = (name: keyof DungeonMap, index: number) => {
		if (map){
			var region;
			if (name === nameOf<DungeonMap>("rooms")){
				region = map.rooms[index];
			}
			else{
				region = map.corridors[index];
			}
			setAlert({ message: "Click anywhere on a wall in the highlighted region to add an entrance.", active: true, severity: "success" });

			props.onAddEntrance(region)
		}
	}

	const handleRegionInstanceDelete = (name: keyof DungeonMap, index: number) => {
		setConfirmFunction(() => confirmInstanceDelete);
		setConfirmMessage("Are you sure you would like to delete this region?");
		setConfirmPrompt("Delete");
		setConfirmArgs({name: name, index: index})
		setConfirmOpen(true);
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
				Object.assign(room, DungeonGenerator.regenerateRegion(room, room.category, newMap.config));
				newMap.updateRoom(args.index, room); 
				DungeonGenerator.generateEntrancesForNeighbours(room, newMap);
			}
			else{
				var corridor = newMap.corridors[args.index];
				Object.assign(corridor, DungeonGenerator.regenerateRegion(corridor, corridor.category, newMap.config));
				newMap.updateCorridor(args.index, corridor); 
				DungeonGenerator.generateEntrancesForNeighbours(corridor, newMap);
			}
			props.onChange(newMap);
		}
		setConfirmOpen(false);
	}

	const confirmRegenerate = (decision: boolean, args: {name: any, index: number}) => {
		var name = args.name as keyof Configuration
		if (decision && name){
			let newMap = Object.create(Object.getPrototypeOf(map)) as DungeonMap;
			Object.assign(newMap, map);
			if (args.name === nameOf<Configuration>("roomCategories")){
				let category = (newMap.config[name] as Probabilities<RoomCategory>).objects[args.index];
				newMap.rooms.forEach((room: RoomInstance, index: number) => {
					if (lodash.isEqual(room.category, category)){
						Object.assign(room, DungeonGenerator.regenerateRegion(room, category, newMap.config));
						newMap.updateRoom(index, room); 
						DungeonGenerator.generateEntrancesForNeighbours(room, newMap);
					}
				});
			}
			else{
				let category = (newMap.config[name] as Probabilities<RoomCategory>).objects[args.index];
				newMap.corridors.forEach((corridor: CorridorInstance, index: number) => {
					if (lodash.isEqual(corridor.category, category)){
						Object.assign(corridor, DungeonGenerator.regenerateRegion(corridor, category, newMap.config));
						newMap.updateCorridor(index, corridor); 
						DungeonGenerator.generateEntrancesForNeighbours(corridor, newMap);
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
			   <Paper style = {{overflow: 'auto'}}>
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
								onChange={handleRegionCatChanges}
								onRegenerateClick={handleRegenerateClick}
								onAddRegionClick={handleAddRegionClick}
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
								onAddEntranceClick={handleAddEntranceClick}
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
					confirmPrompt={confirmPrompt}
					cancelPrompt={confirmPrompt === "Regenerate" ? "Revert" : "Cancel"}
					onDecision={confirmFunction}/>
			}
        </div>
    );
}

export default DungeonEditor;