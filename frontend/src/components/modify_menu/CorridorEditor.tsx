import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import AddBoxIcon from '@material-ui/icons/AddBox';
import cloneDeep from 'lodash/cloneDeep';
import { useState } from 'react';
import Authenticator from '../../Authenticator';
import { MonsterState } from '../../constants/MonsterState';
import { Probabilities } from '../../generator/Probabilities';
import { Item } from '../../models/Item';
import { Monster } from '../../models/Monster';
import { CorridorInstance } from '../../models/CorridorInstance';
import { TileSet } from '../../models/TileSet';
import { Trap } from '../../models/Trap';
import { nameOf, valueOf } from '../../utils/util';
import EnumRadio from '../common/EnumRadio';
import NameList from '../common/NameList';
import ItemEditor from '../content_editors/ItemEditor';
import MonsterEditor from '../content_editors/MonsterEditor';
import SelectItem from '../select/SelectItem';
import SelectMonster from '../select/SelectMonster';
import SelectTileSet from '../select/SelectTileSet';
import SelectTrap from '../select/SelectTrap';
import TrapEditor from '../content_editors/TrapEditor';
import { CorridorWidth } from '../../constants/CorridorWidth';
import { Entrance } from '../../models/Entrance';
import EntranceEditor from '../content_editors/EntranceEditor';


const useStyles = makeStyles((theme) => ({
	root: {
		margin: 0,
		padding: theme.spacing(2),
	},
	editButton: {
		position: 'absolute',
		right: theme.spacing(1),
		top: theme.spacing(1),
		color: theme.palette.grey[500],
	},
	listLabel: {
		display: 'flex',
		alignItems: 'center',
		flexWrap: 'wrap',
	},
	helpIcon: {
		"padding-left": theme.spacing(1),
		"padding-right": theme.spacing(1)
	},
	customWidth: {
		maxWidth: 200,
	}
}));

type Props = {
	open: boolean;
	viewOnly?: boolean;
	corridor?: CorridorInstance;
	savePhrase?: string;
	onCancelClick: () => void;
	onSave?: (corridor: CorridorInstance) => void;
	onAddEntranceClick?: () => void;
}

type Errors = {
	name: boolean;
}

CorridorEditor.defaultProps = {
	viewOnly: false,
}

export default function CorridorEditor(props: Props) {
	const classes = useStyles();

	const [corridor, setCorridor] = useState(() => {
		if (props.corridor !== undefined) {
			return cloneDeep(props.corridor);
		} else {
			var corridorInstance = new CorridorInstance();
			if (!Authenticator.isLoggedIn()) {
				corridorInstance.tileSet = Probabilities.buildUniform([TileSet.getDefault()]).randPickOne()!;
			}
			return corridorInstance;
		}
	});

	const [errors, setErrors] = useState<Errors>({
		name: false
	});
	const [viewMode, setViewMode] = useState(props.viewOnly);

	const [monsterToEdit, setMonsterToEdit] = useState<Monster>()
	const [monsterEditorOpen, setMonsterEditorOpen] = useState<boolean>(false);
	const [selectMonsterDialogOpen, setSelectMonsterDialogOpen] = useState<boolean>(false);

	const [itemToEdit, setItemToEdit] = useState<Item>()
	const [itemEditorOpen, setItemEditorOpen] = useState<boolean>(false);
	const [selectItemDialogOpen, setSelectItemDialogOpen] = useState<boolean>(false);

	const [trapToEdit, setTrapToEdit] = useState<Trap>()
	const [trapEditorOpen, setTrapEditorOpen] = useState<boolean>(false);
	const [selectTrapDialogOpen, setSelectTrapDialogOpen] = useState<boolean>(false);

	const [entranceToEdit, setEntranceToEdit] = useState<Entrance>()
	const [entranceEditorOpen, setEntranceEditorOpen] = useState<boolean>(false);

	const [selectTileSetDialogOpen, setSelectTileSetDialogOpen] = useState<boolean>(false);

	const handleChange = (name: keyof CorridorInstance, value: valueOf<CorridorInstance>) => {
		setCorridor(Object.assign(Object.create(Object.getPrototypeOf(corridor)), corridor, { [name]: value }));
	}

	const handleDeleteClick = (name: keyof CorridorInstance, index: number) => {
		var updatedList = Object.create(Object.getPrototypeOf(corridor[name]));
		updatedList = Object.assign(updatedList, corridor[name]);
		updatedList.remove(index);
		handleChange(name, updatedList);
	}

	const handleSelect = (name: keyof CorridorInstance, item: any) => {
		var updatedList = Object.create(Object.getPrototypeOf(corridor[name]));
		updatedList = Object.assign(updatedList, corridor[name]);
		updatedList.add(item);
		handleChange(name, updatedList);
		closeSelectDialogs();
	}

	const closeSelectDialogs = () => {
		setSelectMonsterDialogOpen(false);
		setSelectItemDialogOpen(false);
		setSelectTrapDialogOpen(false);
	}


	const handleMonsterClick = (m: Monster) => {
		setMonsterToEdit(m);
		setMonsterEditorOpen(true);
	}

	const handleAddMonsterClick = () => {
		setSelectMonsterDialogOpen(true);
	}

	const handleMonsterSave = (newMonster: Monster) => {
		var updatedList = corridor.monsters.map((x) => x);
		var index = updatedList.indexOf(monsterToEdit!);
		if (index > -1){
			updatedList[index] = newMonster;
		}
		handleChange(nameOf<CorridorInstance>("monsters"), updatedList);
		setMonsterEditorOpen(false);
		setMonsterToEdit(undefined);
	}

	const handleItemClick = (i: Item) => {
		setItemToEdit(i);
		setItemEditorOpen(true);
	}

	const handleAddItemClick = () => {
		setSelectItemDialogOpen(true);
	}

	const handleItemSave = (newItem: Item) => {
		var updatedList = corridor.items.map((x) => x);
		var index = updatedList.indexOf(itemToEdit!);
		if (index > -1){
			updatedList[index] = newItem;
		}
		handleChange(nameOf<CorridorInstance>("items"), updatedList);
		setItemEditorOpen(false);
		setItemToEdit(undefined);
	}

	const handleTrapClick = (trap: Trap) => {
		setTrapToEdit(trap);
		setTrapEditorOpen(true);
	}

	const handleAddTrapClick = () => {
		setSelectTrapDialogOpen(true);
	}

	const handleTrapSave = (newTrap: Trap) => {
		var updatedList = Object.create(Object.getPrototypeOf(corridor.traps) as Trap[]);
		updatedList = Object.assign(updatedList, corridor.traps);
		updatedList.updateObject(trapToEdit!, newTrap);
		handleChange(nameOf<CorridorInstance>("traps"), updatedList);
		setTrapEditorOpen(false);
		setTrapToEdit(undefined);
	}

	const handleEntranceClick = (entrance: Entrance) => {
		setEntranceToEdit(entrance);
		setEntranceEditorOpen(true);
	}

	const handleEntranceSave = (newEntrance: Entrance) => {
		var updatedList = corridor.entrances.map((x) => x);
		if (entranceToEdit){
			var index = updatedList.indexOf(entranceToEdit!);
			if (index > -1){
				updatedList[index] = newEntrance;
			}
		}
		else{
			updatedList.push(newEntrance)
		}
		handleChange(nameOf<CorridorInstance>("entrances"), updatedList);
		setEntranceEditorOpen(false);
		setEntranceToEdit(undefined);
	}

	const handleAddTileSetClick = () => {
		setSelectTileSetDialogOpen(true);
	}

	const handleSaveClick = async () => {
		if (!corridor.name) {
			return;
		}

		props.onSave!(corridor);
	}

	const handleClose = () => {
		setCorridor(new CorridorInstance());
	}

	const handleNameBlur = () => {
		if (!corridor.name) {
		  setErrors({
			...errors,
			name: true
		  })
		}
	  }

	return (
		<div>
			<Dialog scroll="paper" maxWidth="md" open={props.open} onClose={handleClose} aria-labelledby="form-dialog-title">
				<div style={{ maxWidth: 650 }}>
					<DialogTitle
						className={classes.root}
						disableTypography
						id="form-dialog-title">
						<Grid container alignItems="center">
							<Typography component={'span'} variant="h6">{viewMode ? "Edit" : "Add"} Corridor {corridor.name} </Typography>
						</Grid>
					</DialogTitle>
					<DialogContent>
						<TextField
							required
							error={errors.name}
							onBlur={handleNameBlur}
							disabled={viewMode}
							variant="outlined"
							autoFocus
							margin="dense"
							id="name"
							label="Name"
							InputLabelProps={{
								shrink: true,
							}}
							fullWidth
							value={corridor.name}
							onChange={(e) => handleChange(nameOf<CorridorInstance>("name"), e.target.value)}
							/>
						<EnumRadio<CorridorWidth>
							label="Width"
							enum={CorridorWidth}
							value={corridor.width}
							disabled={viewMode}
							onChange={(value: CorridorWidth) => handleChange(nameOf<CorridorInstance>("width"), value)}
						/>
						<div className={classes.listLabel}>
							<FormControl disabled={viewMode || !Boolean(corridor.tileSet) || !Authenticator.isLoggedIn()}>
								<FormLabel>Tile Sets</FormLabel>
							</FormControl>
							<IconButton disabled={viewMode || !Boolean(corridor.tileSet) || !Authenticator.isLoggedIn()} onClick={handleAddTileSetClick} aria-label="add" color="primary">
								<AddBoxIcon />
							</IconButton>
						</div>
						<div className={classes.listLabel}>
							<FormControl disabled={viewMode || !Boolean(corridor.monsters)}>
								<FormLabel>Monsters</FormLabel>
							</FormControl>
							<IconButton disabled={viewMode || !Boolean(corridor.monsters)} onClick={handleAddMonsterClick} aria-label="add" color="primary">
								<AddBoxIcon />
							</IconButton>
						</div>
						<NameList
							showDelete={!viewMode}
							disabled={viewMode}
							list={corridor.monsters}
							onClick={handleMonsterClick}
							onDeleteClick={(index) => handleDeleteClick(nameOf<CorridorInstance>("monsters"), index)}
						/>
						<EnumRadio<MonsterState>
							label="Monster State"
							enum={MonsterState}
							disabled={viewMode}
							value={corridor.state}
							onChange={(value: MonsterState) => handleChange(nameOf<CorridorInstance>("state"), value)}
						/>
						<div className={classes.listLabel}>
							<FormControl disabled={viewMode || !Boolean(corridor.items)}>
								<FormLabel>Items</FormLabel>
							</FormControl>
							<IconButton disabled={viewMode || !Boolean(corridor.items)} onClick={handleAddItemClick} aria-label="add" color="primary">
								<AddBoxIcon />
							</IconButton>
						</div>
						<NameList
							showDelete={!viewMode}
							disabled={viewMode}
							list={corridor.items}
							onClick={handleItemClick}
							onDeleteClick={(index) => handleDeleteClick(nameOf<CorridorInstance>("items"), index)}
						/>
						<div className={classes.listLabel}>
							<FormControl disabled={viewMode || !Boolean(corridor.traps)}>
								<FormLabel>Traps</FormLabel>
							</FormControl>
							<IconButton disabled={viewMode || !Boolean(corridor.traps)} onClick={handleAddTrapClick} aria-label="add" color="primary">
								<AddBoxIcon />
							</IconButton>
						</div>
						<NameList
							showDelete={!viewMode}
							disabled={viewMode}
							list={corridor.traps}
							onClick={handleTrapClick}
							onDeleteClick={(index) => handleDeleteClick(nameOf<CorridorInstance>("traps"), index)}
						/>
						<div className={classes.listLabel}>
							<FormControl disabled={viewMode || !Boolean(corridor.entrances)}>
								<FormLabel>Entrances</FormLabel>
							</FormControl>
							<IconButton disabled={viewMode || !Boolean(corridor.entrances)} onClick={props.onAddEntranceClick} aria-label="add" color="primary">
								<AddBoxIcon />
							</IconButton>
						</div>
						<NameList
							showDelete={!viewMode}
							disabled={viewMode}
							list={corridor.entrances.map((x, index) => {x.name = index.toString(); return x})}
							onClick={handleEntranceClick}
							onDeleteClick={(index: number) => handleDeleteClick(nameOf<CorridorInstance>("entrances"), index)}
						/>
					</DialogContent>

					<DialogActions>
						<Button onClick={props.onCancelClick} color="primary">
							Cancel
          				</Button>
						{!viewMode &&
							<Button onClick={handleSaveClick} variant="contained" color="primary">
								{props.savePhrase ? props.savePhrase : "Save"}
							</Button>
						}

					</DialogActions>
				</div>
			</Dialog>
			{selectMonsterDialogOpen &&
				<SelectMonster
					open={selectMonsterDialogOpen}
					exclude={corridor.monsters ? corridor.monsters : []}
					onSelect={(m) => handleSelect(nameOf<CorridorInstance>("monsters"), m)}
					onCancelClick={() => setSelectMonsterDialogOpen(false)}
				/>
			}
			{monsterEditorOpen &&
				<MonsterEditor
					viewOnly
					open={monsterEditorOpen}
					monster={monsterToEdit}
					onSave={(m: Monster) => handleMonsterSave(m)}
					onCancelClick={() => setMonsterEditorOpen(false)}
				/>
			}
			{selectItemDialogOpen &&
				<SelectItem
					open={selectItemDialogOpen}
					exclude={corridor.items ? corridor.items : []}
					onSelect={(i) => handleSelect(nameOf<CorridorInstance>("items"), i)}
					onCancelClick={() => setSelectItemDialogOpen(false)}
				/>
			}
			{itemEditorOpen &&
				<ItemEditor
					viewOnly
					open={itemEditorOpen}
					item={itemToEdit}
					onSave={(i: Item) => handleItemSave(i)}
					onCancelClick={() => setItemEditorOpen(false)}
				/>
			}
			{selectTrapDialogOpen &&
				<SelectTrap
					open={selectTrapDialogOpen}
					exclude={corridor.traps ? corridor.traps : []}
					onSelect={(i) => handleSelect(nameOf<CorridorInstance>("traps"), i)}
					onCancelClick={() => setSelectTrapDialogOpen(false)}
				/>
			}
			{trapEditorOpen &&
				<TrapEditor
					viewOnly
					open={trapEditorOpen}
					trap={trapToEdit}
					onSave={(i: Trap) => handleTrapSave(i)}
					onCancelClick={() => setTrapEditorOpen(false)}
				/>
			}
			{entranceEditorOpen &&
				<EntranceEditor
					viewOnly
					open={entranceEditorOpen}
					entrance={entranceToEdit}
					onSave={(i: Entrance) => handleEntranceSave(i)}
					onCancelClick={() => setEntranceEditorOpen(false)}
				/>
			}
			{selectTileSetDialogOpen &&
				<SelectTileSet
					open={selectTileSetDialogOpen}
					exclude={[corridor.tileSet]}
					onSelect={(i) => handleSelect(nameOf<CorridorInstance>("tileSet"), i)}
					onCancelClick={() => setSelectTileSetDialogOpen(false)}
				/>
			}
		</div>
	);
}