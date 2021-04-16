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
import { RoomShape } from '../../constants/RoomShape';
import { Size } from "../../constants/Size";
import { Probabilities } from '../../generator/Probabilities';
import { Item } from '../../models/Item';
import { Monster } from '../../models/Monster';
import { RoomInstance } from '../../models/RoomInstance';
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
	room?: RoomInstance;
	savePhrase?: string;
	onCancelClick: () => void;
	onSave?: (room: RoomInstance) => void;
	onAddEntranceClick?: () => void;
}

type Errors = {
	name: boolean;
}

RoomEditor.defaultProps = {
	viewOnly: false,
}

export default function RoomEditor(props: Props) {
	const classes = useStyles();

	const [room, setRoom] = useState(() => {
		if (props.room !== undefined) {
			return cloneDeep(props.room);
		} else {
			var roomInstance = new RoomInstance();
			if (!Authenticator.isLoggedIn()) {
				roomInstance.tileSet = Probabilities.buildUniform([TileSet.getDefault()]).randPickOne()!;
			}
			return roomInstance;
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

	const handleChange = (name: keyof RoomInstance, value: valueOf<RoomInstance>) => {
		setRoom(Object.assign(Object.create(Object.getPrototypeOf(room)), room, { [name]: value }));
	}

	const handleDeleteClick = (name: keyof RoomInstance, index: number) => {
		var updatedList = (room[name] as any[]).map((x) => x);
		if (index > -1){
			if (updatedList.length === 1){
				updatedList = [];
			}
			else{
				updatedList[index] = updatedList[updatedList.length - 1];
				updatedList.pop();
			}
		}
		
		handleChange(name, updatedList);
		closeSelectDialogs();
	}

	const handleSelect = (name: keyof RoomInstance, item: any) => {
		var updatedList = (room[name] as any[]).map((x) => x);
		updatedList.push(item);
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
		var updatedList = room.monsters.map((x) => x);
		var index = updatedList.indexOf(monsterToEdit!);
		if (index > -1){
			updatedList[index] = newMonster;
		}
		handleChange(nameOf<RoomInstance>("monsters"), updatedList);
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
		var updatedList = room.items.map((x) => x);
		var index = updatedList.indexOf(itemToEdit!);
		if (index > -1){
			updatedList[index] = newItem;
		}
		handleChange(nameOf<RoomInstance>("items"), updatedList);
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
		var updatedList = room.traps.map((x) => x);
		var index = updatedList.indexOf(trapToEdit!);
		if (index > -1){
			updatedList[index] = newTrap;
		}
		handleChange(nameOf<RoomInstance>("traps"), updatedList);
		setTrapEditorOpen(false);
		setTrapToEdit(undefined);
	}

	const handleEntranceClick = (entrance: Entrance) => {
		setEntranceToEdit(entrance);
		setEntranceEditorOpen(true);
	}

	const handleEntranceSave = (newEntrance: Entrance) => {
		var updatedList = room.entrances.map((x) => x);
		if (entranceToEdit){
			var index = updatedList.indexOf(entranceToEdit!);
			if (index > -1){
				updatedList[index] = newEntrance;
			}
		}
		else{
			updatedList.push(newEntrance)
		}
		handleChange(nameOf<RoomInstance>("entrances"), updatedList);
		setEntranceEditorOpen(false);
		setEntranceToEdit(undefined);
	}

	const handleAddTileSetClick = () => {
		setSelectTileSetDialogOpen(true);
	}

	const handleSaveClick = async () => {
		if (!room.name) {
			return;
		}

		props.onSave!(room);
	}

	const handleClose = () => {
		setRoom(new RoomInstance());
	}

	const handleNameBlur = () => {
		if (!room.name) {
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
							<Typography component={'span'} variant="h6">{viewMode ? "Edit" : "Add"} Room {room.name} </Typography>
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
							value={room.name}
							onChange={(e) => handleChange(nameOf<RoomInstance>("name"), e.target.value)}
							/>
						<EnumRadio<Size>
							label="Size"
							enum={Size}
							value={room.size}
							disabled={viewMode}
							onChange={(value: Size) => handleChange(nameOf<RoomInstance>("size"), value)}
						/>
						<EnumRadio<RoomShape>
							label="Room Shape"
							enum={RoomShape}
							disabled={viewMode}
							value={room.shape}
							onChange={(value: RoomShape) => handleChange(nameOf<RoomInstance>("shape"), value)}
						/>
						<div className={classes.listLabel}>
							<FormControl disabled={viewMode || !Boolean(room.tileSet) || !Authenticator.isLoggedIn()}>
								<FormLabel>Tile Set</FormLabel>
							</FormControl>
							<IconButton disabled={viewMode || !Boolean(room.tileSet) || !Authenticator.isLoggedIn()} onClick={handleAddTileSetClick} aria-label="add" color="primary">
								<AddBoxIcon />
							</IconButton>
						</div>
						<div className={classes.listLabel}>
							<FormControl disabled={viewMode || !Boolean(room.monsters)}>
								<FormLabel>Monsters</FormLabel>
							</FormControl>
							<IconButton disabled={viewMode || !Boolean(room.monsters)} onClick={handleAddMonsterClick} aria-label="add" color="primary">
								<AddBoxIcon />
							</IconButton>
						</div>
						<NameList
							showDelete={!viewMode}
							disabled={viewMode}
							list={room.monsters}
							onClick={handleMonsterClick}
							onDeleteClick={(index: number) => handleDeleteClick(nameOf<RoomInstance>("monsters"), index)}
						/>
						<EnumRadio<MonsterState>
							label="Monster State"
							enum={MonsterState}
							disabled={viewMode}
							value={room.state}
							onChange={(value: MonsterState) => handleChange(nameOf<RoomInstance>("state"), value)}
						/>
						<div className={classes.listLabel}>
							<FormControl disabled={viewMode || !Boolean(room.items)}>
								<FormLabel>Items</FormLabel>
							</FormControl>
							<IconButton disabled={viewMode || !Boolean(room.items)} onClick={handleAddItemClick} aria-label="add" color="primary">
								<AddBoxIcon />
							</IconButton>
						</div>
						<NameList
							showDelete={!viewMode}
							disabled={viewMode}
							list={room.items}
							onClick={handleItemClick}
							onDeleteClick={(index: number) => handleDeleteClick(nameOf<RoomInstance>("items"), index)}
						/>
						<div className={classes.listLabel}>
							<FormControl disabled={viewMode || !Boolean(room.traps)}>
								<FormLabel>Traps</FormLabel>
							</FormControl>
							<IconButton disabled={viewMode || !Boolean(room.traps)} onClick={handleAddTrapClick} aria-label="add" color="primary">
								<AddBoxIcon />
							</IconButton>
						</div>
						<NameList
							showDelete={!viewMode}
							disabled={viewMode}
							list={room.traps}
							onClick={handleTrapClick}
							onDeleteClick={(index: number) => handleDeleteClick(nameOf<RoomInstance>("traps"), index)}
						/>
						<div className={classes.listLabel}>
							<FormControl disabled={viewMode || !Boolean(room.entrances)}>
								<FormLabel>Entrances</FormLabel>
							</FormControl>
							<IconButton disabled={viewMode || !Boolean(room.entrances)} onClick={props.onAddEntranceClick} aria-label="add" color="primary">
								<AddBoxIcon />
							</IconButton>
						</div>
						<NameList
							showDelete={!viewMode}
							disabled={viewMode}
							list={room.entrances.map((x, index) => {x.name = index.toString(); return x})}
							onClick={handleEntranceClick}
							onDeleteClick={(index: number) => handleDeleteClick(nameOf<RoomInstance>("entrances"), index)}
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
					exclude={room.monsters ? room.monsters : []}
					onSelect={(m) => handleSelect(nameOf<RoomInstance>("monsters"), m)}
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
					exclude={room.items ? room.items : []}
					onSelect={(i) => handleSelect(nameOf<RoomInstance>("items"), i)}
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
					exclude={room.traps ? room.traps : []}
					onSelect={(i) => handleSelect(nameOf<RoomInstance>("traps"), i)}
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
					exclude={[room.tileSet]}
					onSelect={(i) => handleSelect(nameOf<RoomInstance>("tileSet"), i)}
					onCancelClick={() => setSelectTileSetDialogOpen(false)}
				/>
			}
		</div>
	);
}