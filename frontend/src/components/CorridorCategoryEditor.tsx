import { useState } from 'react';

import { makeStyles } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
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

import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import EditIcon from '@material-ui/icons/Edit';
import AddBoxIcon from '@material-ui/icons/AddBox';

import EnumProbabilityText from './common/EnumProbabilityText';
import ProbabilityNameList from './common/ProbabilityNameList';
import { CorridorCategory } from '../models/CorridorCategory';
import { Monster } from '../models/Monster';
import { Item } from '../models/Item';
import { Trap } from '../models/Trap';
import { Probabilities } from '../generator/Probabilities';
import { MonsterState } from '../constants/MonsterState';
import { EntranceType } from '../constants/EntranceType';
import { CorridorWidth } from '../constants/CorridorWidth';

import SelectTrap from './SelectTrap';
import SelectMonster from './SelectMonster';
import SelectItem from './SelectItem';
import MonsterEditor from './MonsterEditor';
import ItemEditor from './ItemEditor';
import TrapEditor from './TrapEditor';

import { nameOf, valueOf } from '../utils/util';
import cloneDeep from 'lodash/cloneDeep';
import DB from '../DB';


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
  corridorCategory?: CorridorCategory;
  onCancelClick: () => void;
  onSave?: (rc: CorridorCategory) => void;
}

type Errors = {
  name: boolean;
}

CorridorCategoryEditor.defaultProps = {
  viewOnly: false
}

export default function CorridorCategoryEditor(props: Props) {
  const editMode: boolean = props.corridorCategory !== undefined
  const classes = useStyles();

  const [corridorCategory, setCorridorCategory] = useState(() => {
    if (props.corridorCategory !== undefined) {
      return cloneDeep(props.corridorCategory);
    } else {
      return new CorridorCategory();
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

  const handleChange = (name: keyof CorridorCategory, value: valueOf<CorridorCategory>) => {
    if (name === nameOf<CorridorCategory>("name")){
      if (value) {
        setErrors({
          ...errors,
          name: false
        })
      }
    }
    setCorridorCategory(Object.assign({}, corridorCategory, { [name]: value }) );
  }

  const handleDeleteClick = (name: keyof CorridorCategory, index: number) => {
    var updatedList = Object.create(corridorCategory[name] as Probabilities<any>);
    updatedList = Object.assign(updatedList, corridorCategory[name]);
    updatedList.remove(index);
    handleChange(name, updatedList);
  }

  const handleSelect = (name: keyof CorridorCategory, item: any) => {
    var updatedList = Object.create(corridorCategory[name] as Probabilities<any>);
    updatedList = Object.assign(updatedList, corridorCategory[name]);
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
    var updatedList = Object.create(corridorCategory.monsters as Probabilities<Monster>);
    updatedList = Object.assign(updatedList, corridorCategory.monsters);
    updatedList.updateObject(monsterToEdit!, newMonster);
    handleChange(nameOf<CorridorCategory>("monsters"), updatedList);
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
    var updatedList = Object.create(corridorCategory.items as Probabilities<Item>);
    updatedList = Object.assign(updatedList, corridorCategory.items);
    updatedList.updateObject(itemToEdit!, newItem);
    handleChange(nameOf<CorridorCategory>("items"), updatedList);
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
    var updatedList = Object.create(corridorCategory.traps as Probabilities<Trap>);
    updatedList = Object.assign(updatedList, corridorCategory.traps);
    updatedList.updateObject(trapToEdit!, newTrap);
    handleChange(nameOf<CorridorCategory>("traps"), updatedList);
    setTrapEditorOpen(false);
    setTrapToEdit(undefined);
  }

  const handleEditClick = () => {
    setViewMode(false);
  }

  const handleSaveClick = async () => {
    if (!corridorCategory.name) {
      return;
    }
    corridorCategory.widths.normalize();
    corridorCategory.states.normalize();
    corridorCategory.entranceTypes.normalize();
    corridorCategory.items.normalize();
    corridorCategory.traps.normalize();
    corridorCategory.monsters.normalize();

    var result = await DB.saveCorridorCategory(corridorCategory);
    if (result.valid) {
      var id = result.response;
      corridorCategory.id = id;
    } else {
      window.alert(result.response);
    }
    props.onSave!(corridorCategory);
  }

  const handleClose = () => {
    setCorridorCategory(new CorridorCategory());
  }

  const handleNameBlur = () => {
    if (!corridorCategory.name) {
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
          <Typography component={'span'} variant="h6">{editMode ? "Edit" : "Add"} Corridor Category</Typography>
          {viewMode && editMode &&
            <IconButton aria-label="edit" className={classes.editButton} onClick={handleEditClick}>
              <EditIcon />
            </IconButton>
          }
        </DialogTitle>
        <DialogContent>
        <AppBar color="default" position="static">
          <Tabs value={tab} onChange={handleTabChange} aria-label="simple tabs example" variant="fullWidth" indicatorColor="primary" textColor="primary">
            <Tab label="Basic" {...a11yProps(0)} />
            <Tab 
              label={
                <div className={classes.listLabel}>
                Advanced
                <Tooltip title="The probabilities in each list will be normalized if they don't sum up to 100%" classes={{ tooltip: classes.customWidth }}>
                  <HelpOutlineIcon className={classes.helpIcon} color="primary"></HelpOutlineIcon>
                </Tooltip>
                </div>}
              {...a11yProps(1)} 
            />
          </Tabs>
        </AppBar>
        <TabPanel value={tab} index={0}>
        </TabPanel>
        <TabPanel value={tab} index={1}>
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
              value={corridorCategory.name}
              onChange={(e) => handleChange(nameOf<CorridorCategory>("name"), e.target.value)}
            />
            <EnumProbabilityText<CorridorWidth>
              label="Corridor Width"
              enum={CorridorWidth}
              disabled={viewMode}
              probs={corridorCategory.widths}
              onProbUpdate={(newList: Probabilities<CorridorWidth>) => handleChange(nameOf<CorridorCategory>("widths"), newList)}
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
              list={corridorCategory.monsters}
              onClick={handleMonsterClick}
              onDeleteClick={(index) => handleDeleteClick(nameOf<CorridorCategory>("monsters"), index)}
              onProbUpdate={(newList) => handleChange(nameOf<CorridorCategory>("monsters"), newList)}
            />
            <EnumProbabilityText<MonsterState>
              label="Monster State"
              enum={MonsterState}
              disabled={viewMode}
              probs={corridorCategory.states}
              onProbUpdate={(newList: Probabilities<MonsterState>) => handleChange(nameOf<CorridorCategory>("states"), newList)}
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
              list={corridorCategory.items}
              onClick={handleItemClick}
              onDeleteClick={(index) => handleDeleteClick(nameOf<CorridorCategory>("items"), index)}
              onProbUpdate={(newList) => handleChange(nameOf<CorridorCategory>("items"), newList)}
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
              list={corridorCategory.traps}
              onClick={handleTrapClick}
              onDeleteClick={(index) => handleDeleteClick(nameOf<CorridorCategory>("traps"), index)}
              onProbUpdate={(newList) => handleChange(nameOf<CorridorCategory>("traps"), newList)}
            />
            <EnumProbabilityText<EntranceType>
              label="Entrance Type"
              enum={EntranceType}
              disabled={viewMode}
              probs={corridorCategory.entranceTypes}
              onProbUpdate={(newList: Probabilities<EntranceType>) => handleChange(nameOf<CorridorCategory>("entranceTypes"), newList)}
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
        exclude={corridorCategory.monsters.objects}
        onSelect={(m) => handleSelect(nameOf<CorridorCategory>("monsters"), m)}
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
        exclude={corridorCategory.items.objects}
        onSelect={(i) => handleSelect(nameOf<CorridorCategory>("items"), i)}
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
        exclude={corridorCategory.traps.objects}
        onSelect={(i) => handleSelect(nameOf<CorridorCategory>("traps"), i)}
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