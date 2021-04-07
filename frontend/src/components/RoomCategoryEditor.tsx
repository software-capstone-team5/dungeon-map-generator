import { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import EditIcon from '@material-ui/icons/Edit';
import AddBoxIcon from '@material-ui/icons/AddBox';

import { Size } from "../constants/Size";
import { AppBar, Tab, Tabs, Box, Typography, IconButton, makeStyles, FormLabel} from '@material-ui/core';
import EnumProbabilityText from './common/EnumProbabilityText';
import { RoomCategory } from '../models/RoomCategory';
import { nameOf, valueOf } from '../utils/util';
import { Probabilities } from '../generator/Probabilities';
import { RoomShape } from '../constants/RoomShape';
import { MonsterState } from '../constants/MonsterState';
import { EntranceType } from '../constants/EntranceType';
import cloneDeep from 'lodash/cloneDeep';
import ProbabilityNameList from './common/ProbabilityNameList';
import { Monster } from '../models/Monster';
import MonsterEditor from './MonsterEditor';
import SelectMonster from './SelectMonster';


const useStyles = makeStyles((theme) =>  ({
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
  onCancelClick: ()=>void;
  onSave?: (rc: RoomCategory) => void;
}

RoomCategoryEditor.defaultProps = {
  viewOnly: false
}

export default function RoomCategoryEditor(props: Props) {
  const editMode: boolean = props.roomCategory !== undefined
  
  var initialRoomCategory: RoomCategory;
  if (props.roomCategory !== undefined) {
    initialRoomCategory = cloneDeep(props.roomCategory);
  } else {
    initialRoomCategory = new RoomCategory();
  }

  const classes = useStyles();
  //TODO: Set to 0 so basic is default, do it when basic is complete
  const [tab, setTab] = useState(1);
  const [roomCategory, setRoomCategory] = useState(initialRoomCategory);
  const [viewMode, setViewMode] = useState(props.viewOnly);
  const [monsterToEdit, setMonsterToEdit] = useState<Monster>()
  const [monsterEditorOpen, setMonsterEditorOpen] = useState<boolean>(false);
  const [selectMonsterDialogOpen, setSelectMonsterDialogOpen] = useState<boolean>(false);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };

  const handleChange = (name: keyof RoomCategory, value: valueOf<RoomCategory>) => {
    setRoomCategory(Object.assign({}, roomCategory, { [name]: value }) );
    console.log(roomCategory);
  }

  const handleEnumProbUpdate = (name: keyof RoomCategory, key: any, newValue: number) => {
    var updatedList = (roomCategory[name]) as Probabilities<any>;
    updatedList.update(key, newValue);
    handleChange(name, updatedList);
  }

  const handleDeleteClick = (name: keyof RoomCategory, index: number) => {
    var updatedList = (roomCategory[name]) as Probabilities<any>;
    updatedList.remove(index);
    handleChange(name, updatedList);
  }

  const handleListProbUpdate = (name: keyof RoomCategory, index: number, newValue: number) => {
    var updatedList = (roomCategory[name]) as Probabilities<any>;
    updatedList.probSum[index] = newValue;
    // TODO: normalize?
    handleChange(name, updatedList);
  }

  const handleSelect = (name: keyof RoomCategory, item: any) => {
    var updatedList = (roomCategory[name]) as Probabilities<any>;
    updatedList.add(item, 0.5);
    // TODO: Normalize?
    handleChange(name, updatedList);
    closeSelectDialogs();
  }

  const closeSelectDialogs = () => {
    setSelectMonsterDialogOpen(false);
  }

  const handleMonsterClick = (m: Monster) => {
    setMonsterToEdit(m);
    setMonsterEditorOpen(true);
  }

  const handleAddMonsterClick = () => {
    setSelectMonsterDialogOpen(true);
  }

  const handleMonsterSave = (newMonster: Monster) => {
    var updatedList = roomCategory.monsters;
    updatedList.updateObject(monsterToEdit!, newMonster);
    handleChange(nameOf<RoomCategory>("monsters"), updatedList);
    setMonsterEditorOpen(false);
    setMonsterToEdit(undefined);
}

  const handleEditClick = () => {
    setViewMode(false);
  }

  const handleSaveClick = () => {
    // TODO: Make call to backend
    props.onSave!(roomCategory);
  }

  const handleClose = () => {
    setRoomCategory(new RoomCategory());
  }

  return (
    <div>
      <Dialog open={props.open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle
          className={classes.root}
          disableTypography
          id="form-dialog-title">
          <Typography component={'span'} variant="h6">{editMode ? "Edit": "Add"} Room Category</Typography>
          {viewMode && editMode &&
            <IconButton aria-label="edit" className={classes.editButton} onClick={handleEditClick}>
              <EditIcon />
            </IconButton>
          }
        </DialogTitle>
        <DialogContent>
        <AppBar color="default" position="static">
          <Tabs value={tab} onChange={handleTabChange} aria-label="simple tabs example" variant="fullWidth">
            <Tab label="Basic" {...a11yProps(0)} />
            <Tab label="Advanced" {...a11yProps(1)} />
          </Tabs>
        </AppBar>
        <TabPanel value={tab} index={0}>
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <TextField
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
              onChange={(e)=>handleChange(nameOf<RoomCategory>("name"), e.target.value)}
            />
            <EnumProbabilityText<Size>
              label="Size"
              enum={Size}
              disabled={viewMode}
              probs={roomCategory.sizes}
              onProbUpdate={(enumChanged: Size, newValue: number) => handleEnumProbUpdate(nameOf<RoomCategory>("sizes"), enumChanged, newValue)}
            />
            <EnumProbabilityText<RoomShape>
              label="Room Shape"
              enum={RoomShape}
              disabled={viewMode}
              probs={roomCategory.shapes}
              onProbUpdate={(enumChanged: RoomShape, newValue: number) => handleEnumProbUpdate(nameOf<RoomCategory>("shapes"), enumChanged, newValue)}
            />
            {/* Tile assets */}
            <div className={classes.listLabel}>
                <FormLabel>Monsters</FormLabel>
                <IconButton disabled={viewMode} onClick={handleAddMonsterClick} aria-label="add" color="primary">
                    <AddBoxIcon/>
                </IconButton>
            </div>
            <ProbabilityNameList
              showProbs
              showDelete={!viewMode}
              disabled={viewMode}
              list={roomCategory.monsters}
              onClick={handleMonsterClick}
              onDeleteClick={(index) => handleDeleteClick(nameOf<RoomCategory>("monsters"), index)}
              onProbUpdate={(index, newValue) => handleListProbUpdate(nameOf<RoomCategory>("monsters"), index, newValue)}
            />
            <EnumProbabilityText<MonsterState>
              label="Monster State"
              enum={MonsterState}
              disabled={viewMode}
              probs={roomCategory.states}
              onProbUpdate={(enumChanged: MonsterState, newValue: number) => handleEnumProbUpdate(nameOf<RoomCategory>("states"), enumChanged, newValue)}
            />
            {/* items
                traps
                 */}
            <EnumProbabilityText<EntranceType>
              label="Entrance Type"
              enum={EntranceType}
              disabled={viewMode}
              probs={roomCategory.entranceTypes}
              onProbUpdate={(enumChanged: EntranceType, newValue: number) => handleEnumProbUpdate(nameOf<RoomCategory>("entranceTypes"), enumChanged, newValue)}
            />
        </TabPanel>
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
              onCancelClick={()=>setMonsterEditorOpen(false)}
          />
      }
    </div>
  );
}