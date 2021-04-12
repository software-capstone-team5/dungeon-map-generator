import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import AddBoxIcon from '@material-ui/icons/AddBox';
import EditIcon from '@material-ui/icons/Edit';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import cloneDeep from 'lodash/cloneDeep';
import { useState } from 'react';
import Authenticator from '../Authenticator';
import { EntranceType } from '../constants/EntranceType';
import { MonsterState } from '../constants/MonsterState';
import { RoomShape } from '../constants/RoomShape';
import { Size } from "../constants/Size";
import DB from '../DB';
import { Probabilities } from '../generator/Probabilities';
import { Item } from '../models/Item';
import { Monster } from '../models/Monster';
import { RoomCategory } from '../models/RoomCategory';
import { TileSet } from '../models/TileSet';
import { Trap } from '../models/Trap';
import { nameOf, valueOf } from '../utils/util';
import EnumProbabilityText from './common/EnumProbabilityText';
import ProbabilityNameList from './common/ProbabilityNameList';
import ItemEditor from './ItemEditor';
import MonsterEditor from './MonsterEditor';
import SelectItem from './SelectItem';
import SelectMonster from './SelectMonster';
import SelectTileSet from './SelectTileSet';
import SelectTrap from './SelectTrap';
import TrapEditor from './TrapEditor';


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
  roomCategory?: RoomCategory;
  onCancelClick: () => void;
  onSave?: (rc: RoomCategory) => void;
}

type Errors = {
  name: boolean;
}

RoomCategoryEditor.defaultProps = {
  viewOnly: false
}

export default function RoomCategoryEditor(props: Props) {
  const editMode: boolean = props.roomCategory !== undefined && !props.roomCategory.premade
  const classes = useStyles();

  const [roomCategory, setRoomCategory] = useState(() => {
    if (props.roomCategory !== undefined) {
      return cloneDeep(props.roomCategory);
    } else {
      var roomCat = new RoomCategory();
      if (!Authenticator.isLoggedIn()) {
        roomCat.tileSets = Probabilities.buildUniform([TileSet.getDefault()]);
      }
      return roomCat;
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

  const [selectTileSetDialogOpen, setSelectTileSetDialogOpen] = useState<boolean>(false);

  const handleChange = (name: keyof RoomCategory, value: valueOf<RoomCategory>) => {
    if (name === nameOf<RoomCategory>("name")) {
      if (value) {
        setErrors({
          ...errors,
          name: false
        })
      }
    }
    setRoomCategory(Object.assign(Object.create(Object.getPrototypeOf(roomCategory)), roomCategory, { [name]: value }));
  }

  const handleDeleteClick = (name: keyof RoomCategory, index: number) => {
    var updatedList = Object.create(Object.getPrototypeOf(roomCategory[name]) as Probabilities<any>);
    updatedList = Object.assign(updatedList, roomCategory[name]);
    updatedList.remove(index);
    handleChange(name, updatedList);
  }

  const handleSelect = (name: keyof RoomCategory, item: any) => {
    var updatedList = Object.create(Object.getPrototypeOf(roomCategory[name]) as Probabilities<any>);
    updatedList = Object.assign(updatedList, roomCategory[name]);
    updatedList.add(item);
    handleChange(name, updatedList);
    closeSelectDialogs();
  }

  const closeSelectDialogs = () => {
    setSelectMonsterDialogOpen(false);
    setSelectItemDialogOpen(false);
    setSelectTrapDialogOpen(false);
  }

  const handleMonsterDefaultChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      handleChange(nameOf<RoomCategory>("monsters"), null);
    } else {
      handleChange(nameOf<RoomCategory>("monsters"), new Probabilities<Monster>(null));
    }
  }

  const handleMonsterClick = (m: Monster) => {
    setMonsterToEdit(m);
    setMonsterEditorOpen(true);
  }

  const handleAddMonsterClick = () => {
    setSelectMonsterDialogOpen(true);
  }

  const handleMonsterSave = (newMonster: Monster) => {
    var updatedList = Object.create(Object.getPrototypeOf(roomCategory.monsters) as Probabilities<Monster>);
    updatedList = Object.assign(updatedList, roomCategory.monsters);
    updatedList.updateObject(monsterToEdit!, newMonster);
    handleChange(nameOf<RoomCategory>("monsters"), updatedList);
    setMonsterEditorOpen(false);
    setMonsterToEdit(undefined);
  }

  const handleItemDefaultChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      handleChange(nameOf<RoomCategory>("items"), null);
    } else {
      handleChange(nameOf<RoomCategory>("items"), new Probabilities<Item>(null));
    }
  }

  const handleItemClick = (i: Item) => {
    setItemToEdit(i);
    setItemEditorOpen(true);
  }

  const handleAddItemClick = () => {
    setSelectItemDialogOpen(true);
  }

  const handleItemSave = (newItem: Item) => {
    var updatedList = Object.create(Object.getPrototypeOf(roomCategory.items) as Probabilities<Item>);
    updatedList = Object.assign(updatedList, roomCategory.items);
    updatedList.updateObject(itemToEdit!, newItem);
    handleChange(nameOf<RoomCategory>("items"), updatedList);
    setItemEditorOpen(false);
    setItemToEdit(undefined);
  }

  const handleTrapDefaultChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      handleChange(nameOf<RoomCategory>("traps"), null);
    } else {
      handleChange(nameOf<RoomCategory>("traps"), new Probabilities<Trap>(null));
    }
  }

  const handleTrapClick = (trap: Trap) => {
    setTrapToEdit(trap);
    setTrapEditorOpen(true);
  }

  const handleAddTrapClick = () => {
    setSelectTrapDialogOpen(true);
  }

  const handleTrapSave = (newTrap: Trap) => {
    var updatedList = Object.create(Object.getPrototypeOf(roomCategory.traps) as Probabilities<Trap>);
    updatedList = Object.assign(updatedList, roomCategory.traps);
    updatedList.updateObject(trapToEdit!, newTrap);
    handleChange(nameOf<RoomCategory>("traps"), updatedList);
    setTrapEditorOpen(false);
    setTrapToEdit(undefined);
  }

  const handleTileSetDefaultChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      handleChange(nameOf<RoomCategory>("tileSets"), null);
    } else {
      handleChange(nameOf<RoomCategory>("tileSets"), new Probabilities<TileSet>(null));
    }
  }

  const handleAddTileSetClick = () => {
    setSelectTileSetDialogOpen(true);
  }

  const handleEditClick = () => {
    setViewMode(false);
  }

  const handleSaveClick = async () => {
    if (!roomCategory.name) {
      return;
    }
    if (roomCategory.tileSets) {
      roomCategory.tileSets.normalize();
    }
    if (roomCategory.shapes) {
      roomCategory.shapes.normalize();
    }
    if (roomCategory.sizes) {
      roomCategory.sizes.normalize();
    }
    if (roomCategory.states) {
      roomCategory.states.normalize();
    }
    if (roomCategory.entranceTypes) {
      roomCategory.entranceTypes.normalize();
    }
    if (roomCategory.items) {
      roomCategory.items.normalize();
    }
    if (roomCategory.traps) {
      roomCategory.traps.normalize();
    }
    if (roomCategory.monsters) {
      roomCategory.monsters.normalize();
    }

    if (Authenticator.isLoggedIn()) {
      var result = await DB.saveRoomCategory(roomCategory);
      if (result && result.valid) {
        var id = result.response;
        roomCategory.id = id;
      } else {
        if (result) {
          window.alert(result.response);
        }
      }
    }

    props.onSave!(roomCategory);
  }

  const handleClose = () => {
    setRoomCategory(new RoomCategory());
  }

  const handleNameBlur = () => {
    if (!roomCategory.name) {
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
              <Typography component={'span'} variant="h6">{editMode ? "Edit" : viewMode ? "View" : "Add"} Room Category</Typography>
              <Tooltip
                arrow
                classes={{ tooltip: classes.customWidth }}
                title={
                  <>
                    <Typography align="center" color="inherit"><u>Help</u></Typography>
                    <p><Typography display="inline" color="inherit">%:</Typography> The probabilities in each list will be normalized if they don't sum up to 100%</p>
                    <p><Typography variant="body2" display="inline" color="inherit">Default:</Typography> If a Room has "Use Default" checked for any option,
                          it will use the values in the Default Room.</p>
                    <p>The Default Room cannot have "Use Default" checked for any option.</p>
                  </>
                }
              >
                <HelpOutlineIcon className={classes.helpIcon} color="primary"></HelpOutlineIcon>
              </Tooltip>
            </Grid>
            {viewMode && editMode &&
              <IconButton aria-label="edit" className={classes.editButton} onClick={handleEditClick}>
                <EditIcon />
              </IconButton>
            }
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
              value={roomCategory.name}
              onChange={(e) => handleChange(nameOf<RoomCategory>("name"), e.target.value)}
            />
            <EnumProbabilityText<Size>
              label="Size"
              enum={Size}
              disabled={viewMode}
              probs={roomCategory.sizes}
              onProbUpdate={(newList: Probabilities<Size> | null) => handleChange(nameOf<RoomCategory>("sizes"), newList)}
            />
            <EnumProbabilityText<RoomShape>
              label="Room Shape"
              enum={RoomShape}
              disabled={viewMode}
              probs={roomCategory.shapes}
              onProbUpdate={(newList: Probabilities<RoomShape> | null) => handleChange(nameOf<RoomCategory>("shapes"), newList)}
            />
            <div className={classes.listLabel}>
              <FormControl disabled={viewMode || !Boolean(roomCategory.tileSets) || !Authenticator.isLoggedIn()}>
                <FormLabel>Tile Sets</FormLabel>
              </FormControl>
              <IconButton disabled={viewMode || !Boolean(roomCategory.tileSets) || !Authenticator.isLoggedIn()} onClick={handleAddTileSetClick} aria-label="add" color="primary">
                <AddBoxIcon />
              </IconButton>
              <FormControlLabel
                disabled={viewMode || !Authenticator.isLoggedIn()}
                control={
                  <Checkbox
                    checked={!Boolean(roomCategory.tileSets)}
                    onChange={handleTileSetDefaultChange}
                    name="useDefault"
                    color="default"
                  />
                }
                label="Use Default"
              />
            </div>
            <div className={classes.listLabel}>
              <FormControl disabled={viewMode || !Boolean(roomCategory.monsters)}>
                <FormLabel>Monsters</FormLabel>
              </FormControl>
              <IconButton disabled={viewMode || !Boolean(roomCategory.monsters)} onClick={handleAddMonsterClick} aria-label="add" color="primary">
                <AddBoxIcon />
              </IconButton>
              <FormControlLabel
                disabled={viewMode}
                control={
                  <Checkbox
                    checked={!Boolean(roomCategory.monsters)}
                    onChange={handleMonsterDefaultChange}
                    name="useDefault"
                    color="default"
                  />
                }
                label="Use Default"
              />
            </div>
            <ProbabilityNameList
              showProbs
              showDelete={!viewMode}
              disabled={viewMode}
              list={roomCategory.monsters}
              onClick={handleMonsterClick}
              onDeleteClick={(index) => handleDeleteClick(nameOf<RoomCategory>("monsters"), index)}
              onProbUpdate={(newList) => handleChange(nameOf<RoomCategory>("monsters"), newList)}
            />
            <EnumProbabilityText<MonsterState>
              label="Monster State"
              enum={MonsterState}
              disabled={viewMode}
              probs={roomCategory.states}
              onProbUpdate={(newList: Probabilities<MonsterState> | null) => handleChange(nameOf<RoomCategory>("states"), newList)}
            />
            <div className={classes.listLabel}>
              <FormControl disabled={viewMode || !Boolean(roomCategory.items)}>
                <FormLabel>Items</FormLabel>
              </FormControl>
              <IconButton disabled={viewMode || !Boolean(roomCategory.items)} onClick={handleAddItemClick} aria-label="add" color="primary">
                <AddBoxIcon />
              </IconButton>
              <FormControlLabel
                disabled={viewMode}
                control={
                  <Checkbox
                    checked={!Boolean(roomCategory.items)}
                    onChange={handleItemDefaultChange}
                    name="useDefault"
                    color="default"
                  />
                }
                label="Use Default"
              />
            </div>
            <ProbabilityNameList
              showProbs
              showDelete={!viewMode}
              disabled={viewMode}
              list={roomCategory.items}
              onClick={handleItemClick}
              onDeleteClick={(index) => handleDeleteClick(nameOf<RoomCategory>("items"), index)}
              onProbUpdate={(newList) => handleChange(nameOf<RoomCategory>("items"), newList)}
            />
            <div className={classes.listLabel}>
              <FormControl disabled={viewMode || !Boolean(roomCategory.traps)}>
                <FormLabel>Traps</FormLabel>
              </FormControl>
              <IconButton disabled={viewMode || !Boolean(roomCategory.traps)} onClick={handleAddTrapClick} aria-label="add" color="primary">
                <AddBoxIcon />
              </IconButton>
              <FormControlLabel
                disabled={viewMode}
                control={
                  <Checkbox
                    checked={!Boolean(roomCategory.traps)}
                    onChange={handleTrapDefaultChange}
                    name="useDefault"
                    color="default"
                  />
                }
                label="Use Default"
              />
            </div>
            <ProbabilityNameList
              showProbs
              showDelete={!viewMode}
              disabled={viewMode}
              list={roomCategory.traps}
              onClick={handleTrapClick}
              onDeleteClick={(index) => handleDeleteClick(nameOf<RoomCategory>("traps"), index)}
              onProbUpdate={(newList) => handleChange(nameOf<RoomCategory>("traps"), newList)}
            />
            <EnumProbabilityText<EntranceType>
              label="Entrance Type"
              enum={EntranceType}
              disabled={viewMode}
              probs={roomCategory.entranceTypes}
              onProbUpdate={(newList: Probabilities<EntranceType> | null) => handleChange(nameOf<RoomCategory>("entranceTypes"), newList)}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={props.onCancelClick} color="primary">
              Cancel
          </Button>
            {!viewMode &&
              <Button onClick={handleSaveClick} variant="contained" color="primary">
                Save
            </Button>
            }

          </DialogActions>
        </div>
      </Dialog>
      {selectMonsterDialogOpen &&
        <SelectMonster
          open={selectMonsterDialogOpen}
          exclude={roomCategory.monsters ? roomCategory.monsters.objects : []}
          onSelect={(m) => handleSelect(nameOf<RoomCategory>("monsters"), m)}
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
          exclude={roomCategory.items ? roomCategory.items.objects : []}
          onSelect={(i) => handleSelect(nameOf<RoomCategory>("items"), i)}
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
          exclude={roomCategory.traps ? roomCategory.traps.objects : []}
          onSelect={(i) => handleSelect(nameOf<RoomCategory>("traps"), i)}
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
      {selectTileSetDialogOpen &&
        <SelectTileSet
          open={selectTileSetDialogOpen}
          exclude={roomCategory.tileSets ? roomCategory.tileSets.objects : []}
          onSelect={(i) => handleSelect(nameOf<RoomCategory>("tileSets"), i)}
          onCancelClick={() => setSelectTileSetDialogOpen(false)}
        />
      }
    </div>
  );
}