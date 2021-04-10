import { useState } from 'react';

import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import FormLabel from '@material-ui/core/FormLabel';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';

import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import EditIcon from '@material-ui/icons/Edit';
import AddBoxIcon from '@material-ui/icons/AddBox';

import EnumProbabilityText from './common/EnumProbabilityText';
import ProbabilityNameList from './common/ProbabilityNameList';
import { RoomCategory } from '../models/RoomCategory';
import { Monster } from '../models/Monster';
import { Item } from '../models/Item';
import { Trap } from '../models/Trap';
import { Probabilities } from '../generator/Probabilities';
import { MonsterState } from '../constants/MonsterState';
import { EntranceType } from '../constants/EntranceType';
import { Size } from "../constants/Size";
import { RoomShape } from '../constants/RoomShape';

import SelectTrap from './SelectTrap';
import SelectMonster from './SelectMonster';
import SelectItem from './SelectItem';
import MonsterEditor from './MonsterEditor';
import ItemEditor from './ItemEditor';
import TrapEditor from './TrapEditor';

import { nameOf, valueOf } from '../utils/util';
import cloneDeep from 'lodash/cloneDeep';
import DB from '../DB';
import Authenticator from '../Authenticator';


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

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  );
}

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
  const editMode: boolean = props.roomCategory !== undefined
  const classes = useStyles();
  
  const [roomCategory, setRoomCategory] = useState(() => {
    if (props.roomCategory !== undefined) {
      return cloneDeep(props.roomCategory);
    } else {
      return new RoomCategory();
    }
  });

  const [errors, setErrors] = useState<Errors>({
    name: false
  });
  //TODO: Set to 0 so basic is default, do it when basic is complete
  const [tab, setTab] = useState(1);
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

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };

  const handleChange = (name: keyof RoomCategory, value: valueOf<RoomCategory>) => {
    if (name === nameOf<RoomCategory>("name")){
      if (value) {
        setErrors({
          ...errors,
          name: false
        })
      }
    }
    setRoomCategory(Object.assign({}, roomCategory, { [name]: value }) );
  }

  const handleDeleteClick = (name: keyof RoomCategory, index: number) => {
    var updatedList = Object.create(roomCategory[name] as Probabilities<any>);
    updatedList = Object.assign(updatedList, roomCategory[name]);
    updatedList.remove(index);
    handleChange(name, updatedList);
  }

  const handleSelect = (name: keyof RoomCategory, item: any) => {
    var updatedList = Object.create(roomCategory[name] as Probabilities<any>);
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

  const handleMonsterClick = (m: Monster) => {
    setMonsterToEdit(m);
    setMonsterEditorOpen(true);
  }

  const handleAddMonsterClick = () => {
    setSelectMonsterDialogOpen(true);
  }

  const handleMonsterSave = (newMonster: Monster) => {
    var updatedList = Object.create(roomCategory.monsters as Probabilities<Monster>);
    updatedList = Object.assign(updatedList, roomCategory.monsters);
    updatedList.updateObject(monsterToEdit!, newMonster);
    handleChange(nameOf<RoomCategory>("monsters"), updatedList);
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
    var updatedList = Object.create(roomCategory.items as Probabilities<Item>);
    updatedList = Object.assign(updatedList, roomCategory.items);
    updatedList.updateObject(itemToEdit!, newItem);
    handleChange(nameOf<RoomCategory>("items"), updatedList);
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
    var updatedList = Object.create(roomCategory.traps as Probabilities<Trap>);
    updatedList = Object.assign(updatedList, roomCategory.traps);
    updatedList.updateObject(trapToEdit!, newTrap);
    handleChange(nameOf<RoomCategory>("traps"), updatedList);
    setTrapEditorOpen(false);
    setTrapToEdit(undefined);
  }

  const handleEditClick = () => {
    setViewMode(false);
  }

  const handleSaveClick = async () => {
    if (!roomCategory.name) {
      return;
    }
    // TODO : Normalize tileset
    roomCategory.shapes.normalize();
    roomCategory.sizes.normalize();
    roomCategory.states.normalize();
    roomCategory.entranceTypes.normalize();
    roomCategory.items.normalize();
    roomCategory.traps.normalize();
    roomCategory.monsters.normalize();

    if (Authenticator.isLoggedIn()) {
      var result = await DB.saveRoomCategory(roomCategory);
      if (result && result.valid) {
        var id = result.response;
        roomCategory.id = id;
      } else {
        window.alert(result.response);
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
      <Dialog open={props.open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle
          className={classes.root}
          disableTypography
          id="form-dialog-title">
            <Grid container alignItems="center">
              <Typography component={'span'} variant="h6">{editMode ? "Edit" : "Add"} Room Category</Typography>
              <Tooltip title="The probabilities in each list will be normalized if they don't sum up to 100%" classes={{ tooltip: classes.customWidth }}>
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
              onProbUpdate={(newList: Probabilities<Size>) => handleChange(nameOf<RoomCategory>("sizes"), newList)}
            />
            <EnumProbabilityText<RoomShape>
              label="Room Shape"
              enum={RoomShape}
              disabled={viewMode}
              probs={roomCategory.shapes}
              onProbUpdate={(newList: Probabilities<RoomShape>) => handleChange(nameOf<RoomCategory>("shapes"), newList)}
            />
            {/* Tile assets */}
            <div className={classes.listLabel}>
              <FormLabel>Monsters</FormLabel>
              <IconButton disabled={viewMode} onClick={handleAddMonsterClick} aria-label="add" color="primary">
                <AddBoxIcon />
              </IconButton>
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
              onProbUpdate={(newList: Probabilities<MonsterState>) => handleChange(nameOf<RoomCategory>("states"), newList)}
            />
            <div className={classes.listLabel}>
              <FormLabel>Items</FormLabel>
              <IconButton disabled={viewMode} onClick={handleAddItemClick} aria-label="add" color="primary">
                <AddBoxIcon />
              </IconButton>
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
              <FormLabel>Traps</FormLabel>
              <IconButton disabled={viewMode} onClick={handleAddTrapClick} aria-label="add" color="primary">
                <AddBoxIcon />
              </IconButton>
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
              onProbUpdate={(newList: Probabilities<EntranceType>) => handleChange(nameOf<RoomCategory>("entranceTypes"), newList)}
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
      </Dialog>
      <SelectMonster
        open={selectMonsterDialogOpen}
        exclude={roomCategory.monsters.objects}
        onSelect={(m) => handleSelect(nameOf<RoomCategory>("monsters"), m)}
        onCancelClick={() => setSelectMonsterDialogOpen(false)}
      />
      {monsterEditorOpen &&
        <MonsterEditor
          viewOnly
          open={monsterEditorOpen}
          monster={monsterToEdit}
          onSave={(m: Monster) => handleMonsterSave(m)}
          onCancelClick={() => setMonsterEditorOpen(false)}
        />
      }
      <SelectItem
        open={selectItemDialogOpen}
        exclude={roomCategory.items.objects}
        onSelect={(i) => handleSelect(nameOf<RoomCategory>("items"), i)}
        onCancelClick={() => setSelectItemDialogOpen(false)}
      />
      {itemEditorOpen &&
        <ItemEditor
          viewOnly
          open={itemEditorOpen}
          item={itemToEdit}
          onSave={(i: Item) => handleItemSave(i)}
          onCancelClick={() => setItemEditorOpen(false)}
        />
      }
      <SelectTrap
        open={selectTrapDialogOpen}
        exclude={roomCategory.traps.objects}
        onSelect={(i) => handleSelect(nameOf<RoomCategory>("traps"), i)}
        onCancelClick={() => setSelectTrapDialogOpen(false)}
      />
      {trapEditorOpen &&
        <TrapEditor
          viewOnly
          open={trapEditorOpen}
          trap={trapToEdit}
          onSave={(i: Trap) => handleTrapSave(i)}
          onCancelClick={() => setTrapEditorOpen(false)}
        />
      }
    </div>
  );
}