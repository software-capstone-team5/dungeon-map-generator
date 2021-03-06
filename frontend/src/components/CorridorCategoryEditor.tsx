// REQ-29: Edit.CorridorCategory.Width - The system should allow the user to edit the possible widths of a corridor category and their probabilities. The available options are Small, Medium, and Large.
// REQ-30: Edit.CorridorCategory.TileAssets - The system should allow the user to edit the image assets that will be used when displaying the corridor .
// REQ-31: Edit.CorridorCategory.Monsters - The system should allow the user to edit the monsters/enemies that can appear in the corridor, along with their probabilities.
// REQ-32: Edit.CorridorCategory.MonsterStates - The system should allow the user to edit the possible states that the monsters/enemies can be in, and their probabilities. The states are from a predefined list.
// REQ-33: Edit.CorridorCategory.Items - The system should allow the user to edit the possible items that can appear in the corridor, and their probabilities.
// REQ-34: Edit.CorridorCategory.Entrances - The system should allow the user to edit the types of entrances that are possible in a corridor, and their probabilities. The possible entrances are Regular, Locked, and Secret.
// REQ-35: Edit.CorridorCategory.Traps- The system should allow the user to edit the types of traps that are possible in a corridor, and their probabilities. The types of traps available will be from a predefined list.
// REQ-36: Edit.DefaultCorridorCategory - The system should allow the user to edit the various options for the Default Corridor Category. A Corridor Category will use the default’s properties if their properties are not specified.
// REQ-37: Save.CorridorCategory - The system should allow the user to save a Corridor Category that they have created in the database. The user should be able to access the saved Corridor Category in other Presets and in future log-ins.


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
import { CorridorWidth } from '../constants/CorridorWidth';
import { EntranceType } from '../constants/EntranceType';
import { MonsterState } from '../constants/MonsterState';
import DB from '../DB';
import { Probabilities } from '../generator/Probabilities';
import { CorridorCategory } from '../models/CorridorCategory';
import { Item } from '../models/Item';
import { Monster } from '../models/Monster';
import { Trap } from '../models/Trap';
import { nameOf, valueOf } from '../utils/util';
import EnumProbabilityText from './common/EnumProbabilityText';
import ProbabilityNameList from './common/ProbabilityNameList';
import ItemEditor from './content_editors/ItemEditor';
import MonsterEditor from './content_editors/MonsterEditor';
import TrapEditor from './content_editors/TrapEditor';
import SelectItem from './select/SelectItem';
import SelectMonster from './select/SelectMonster';
import SelectTrap from './select/SelectTrap';


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
  isDefault?: boolean;
  saveToDB?: boolean;
  corridorCategory?: CorridorCategory;
  savePhrase?: string;
  onCancelClick: () => void;
  onSave?: (rc: CorridorCategory) => void;
}

type Errors = {
  name: boolean;
}

CorridorCategoryEditor.defaultProps = {
  viewOnly: false,
  isDefault: false,
  saveToDB: true,
}

export default function CorridorCategoryEditor(props: Props) {
  const editMode: boolean = props.corridorCategory !== undefined && !props.corridorCategory.premade;
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

  // const [selectTileSetDialogOpen, setSelectTileSetDialogOpen] = useState<boolean>(false);

  const handleChange = (name: keyof CorridorCategory, value: valueOf<CorridorCategory>) => {
    if (name === nameOf<CorridorCategory>("name")) {
      if (value) {
        setErrors({
          ...errors,
          name: false
        })
      }
    }
    setCorridorCategory(Object.assign(Object.create(Object.getPrototypeOf(corridorCategory)), corridorCategory, { [name]: value }));
  }

  const handleDeleteClick = (name: keyof CorridorCategory, index: number) => {
    var updatedList = Object.create(Object.getPrototypeOf(corridorCategory[name]) as Probabilities<any>);
    updatedList = Object.assign(updatedList, corridorCategory[name]);
    updatedList.remove(index);
    handleChange(name, updatedList);
  }

  const handleSelect = (name: keyof CorridorCategory, item: any) => {
    var updatedList = Object.create(Object.getPrototypeOf(corridorCategory[name]) as Probabilities<any>);
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

  const handleMonsterDefaultChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      handleChange(nameOf<CorridorCategory>("monsters"), null);
    } else {
      handleChange(nameOf<CorridorCategory>("monsters"), new Probabilities<Monster>(null));
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
    var updatedList = Object.create(Object.getPrototypeOf(corridorCategory.monsters) as Probabilities<Monster>);
    updatedList = Object.assign(updatedList, corridorCategory.monsters);
    updatedList.updateObject(monsterToEdit!, newMonster);
    handleChange(nameOf<CorridorCategory>("monsters"), updatedList);
    setMonsterEditorOpen(false);
    setMonsterToEdit(undefined);
  }

  const handleItemDefaultChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      handleChange(nameOf<CorridorCategory>("items"), null);
    } else {
      handleChange(nameOf<CorridorCategory>("items"), new Probabilities<Item>(null));
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
    var updatedList = Object.create(Object.getPrototypeOf(corridorCategory.items) as Probabilities<Item>);
    updatedList = Object.assign(updatedList, corridorCategory.items);
    updatedList.updateObject(itemToEdit!, newItem);
    handleChange(nameOf<CorridorCategory>("items"), updatedList);
    setItemEditorOpen(false);
    setItemToEdit(undefined);
  }

  const handleTrapDefaultChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      handleChange(nameOf<CorridorCategory>("traps"), null);
    } else {
      handleChange(nameOf<CorridorCategory>("traps"), new Probabilities<Trap>(null));
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
    var updatedList = Object.create(Object.getPrototypeOf(corridorCategory.traps) as Probabilities<Trap>);
    updatedList = Object.assign(updatedList, corridorCategory.traps);
    updatedList.updateObject(trapToEdit!, newTrap);
    handleChange(nameOf<CorridorCategory>("traps"), updatedList);
    setTrapEditorOpen(false);
    setTrapToEdit(undefined);
  }

  // const handleTileSetDefaultChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   if (event.target.checked) {
  //     handleChange(nameOf<CorridorCategory>("tileSets"), null);
  //   } else {
  //     handleChange(nameOf<CorridorCategory>("tileSets"), new Probabilities<TileSet>(null));
  //   }
  // }

  // const handleAddTileSetClick = () => {
  //   setSelectTileSetDialogOpen(true);
  // }

  const handleEditClick = () => {
    setViewMode(false);
  }

  const handleSaveClick = async () => {
    if (!corridorCategory.name) {
      return;
    }
    if (corridorCategory.tileSets) {
      corridorCategory.tileSets.normalize();
    }
    if (corridorCategory.widths) {
      corridorCategory.widths.normalize();
    }
    if (corridorCategory.states) {
      corridorCategory.states.normalize();
    }
    if (corridorCategory.entranceTypes) {
      corridorCategory.entranceTypes.normalize();
    }
    if (corridorCategory.items) {
      corridorCategory.items.normalize();
    }
    if (corridorCategory.traps) {
      corridorCategory.traps.normalize();
    }
    if (corridorCategory.monsters) {
      corridorCategory.monsters.normalize();
    }

    if (props.saveToDB && Authenticator.isLoggedIn()) {
      var result = await DB.saveCorridorCategory(corridorCategory);
      if (result && result.valid) {
        var id = result.response;
        corridorCategory.id = id;
      } else {
        if (result) {
          window.alert(result.response);
        }
      }
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
      <Dialog scroll="paper" maxWidth="md" open={props.open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <div style={{ maxWidth: 650 }}>
          <DialogTitle
            className={classes.root}
            disableTypography
            id="form-dialog-title">
            <Grid container alignItems="center">
              <Typography component={'span'} variant="h6">{editMode ? "Edit" : viewMode ? "View" : "Add"} Corridor Category</Typography>
              <Tooltip
                arrow
                classes={{ tooltip: classes.customWidth }}
                title={
                  <>
                    <Typography align="center" color="inherit"><u>Help</u></Typography>
                    <p><Typography display="inline" color="inherit">%:</Typography> The probabilities in each list will be normalized if they don't sum up to 100%</p>
                    <p><Typography variant="body2" display="inline" color="inherit">Default:</Typography> If a Corridor has "Use Default" checked for any option,
                          it will use the values in the Default Corridor.</p>
                    <p>The Default Corridor cannot have "Use Default" checked for any option.</p>
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
              value={corridorCategory.name}
              onChange={(e) => handleChange(nameOf<CorridorCategory>("name"), e.target.value)}
            />
            <EnumProbabilityText<CorridorWidth>
              label="Corridor Width"
              enum={CorridorWidth}
              disabled={viewMode}
              probs={corridorCategory.widths}
              onProbUpdate={(newList: Probabilities<CorridorWidth> | null) => handleChange(nameOf<CorridorCategory>("widths"), newList)}
            />
            {/* <div className={classes.listLabel}>
              <FormControl disabled={viewMode || !Boolean(corridorCategory.tileSets) || !Authenticator.isLoggedIn()}>
                <FormLabel>Tile Sets</FormLabel>
              </FormControl>
              <IconButton disabled={viewMode || !Boolean(corridorCategory.tileSets) || !Authenticator.isLoggedIn()} onClick={handleAddTileSetClick} aria-label="add" color="primary">
                <AddBoxIcon />
              </IconButton>
              {!props.isDefault && 
                <FormControlLabel
                  disabled={viewMode || !Authenticator.isLoggedIn()}
                  control={
                    <Checkbox
                      checked={!Boolean(corridorCategory.tileSets)}
                      onChange={handleTileSetDefaultChange}
                      name="useDefault"
                      color="default"
                    />
                  }
                  label="Use Default"
                />
              }
            </div> */}
            <div className={classes.listLabel}>
              <FormControl disabled={viewMode || !Boolean(corridorCategory.monsters)}>
                <FormLabel>Monsters</FormLabel>
              </FormControl>
              <IconButton disabled={viewMode || !Boolean(corridorCategory.monsters)} onClick={handleAddMonsterClick} aria-label="add" color="primary">
                <AddBoxIcon />
              </IconButton>
              {!props.isDefault && 
                <FormControlLabel
                  disabled={viewMode}
                  control={
                    <Checkbox
                      checked={!Boolean(corridorCategory.monsters)}
                      onChange={handleMonsterDefaultChange}
                      name="useDefault"
                      color="default"
                    />
                  }
                  label="Use Default"
                />
              }
            </div>
            <ProbabilityNameList
              showProbs
              disableProbs={viewMode}
              showDelete={!viewMode}
              disableListItem={viewMode && editMode}
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
              onProbUpdate={(newList: Probabilities<MonsterState> | null) => handleChange(nameOf<CorridorCategory>("states"), newList)}
            />
            <div className={classes.listLabel}>
              <FormControl disabled={viewMode || !Boolean(corridorCategory.items)}>
                <FormLabel>Items</FormLabel>
              </FormControl>
              <IconButton disabled={viewMode || !Boolean(corridorCategory.items)} onClick={handleAddItemClick} aria-label="add" color="primary">
                <AddBoxIcon />
              </IconButton>
              {!props.isDefault && 
                <FormControlLabel
                  disabled={viewMode}
                  control={
                    <Checkbox
                      checked={!Boolean(corridorCategory.items)}
                      onChange={handleItemDefaultChange}
                      name="useDefault"
                      color="default"
                    />
                  }
                  label="Use Default"
                />
              }
            </div>
            <ProbabilityNameList
              showProbs
              disableProbs={viewMode}
              showDelete={!viewMode}
              disableListItem={viewMode && editMode}
              list={corridorCategory.items}
              onClick={handleItemClick}
              onDeleteClick={(index) => handleDeleteClick(nameOf<CorridorCategory>("items"), index)}
              onProbUpdate={(newList) => handleChange(nameOf<CorridorCategory>("items"), newList)}
            />
            <div className={classes.listLabel}>
              <FormControl disabled={viewMode || !Boolean(corridorCategory.traps)}>
                <FormLabel>Traps</FormLabel>
              </FormControl>
              <IconButton disabled={viewMode || !Boolean(corridorCategory.traps)} onClick={handleAddTrapClick} aria-label="add" color="primary">
                <AddBoxIcon />
              </IconButton>
              {!props.isDefault && 
                <FormControlLabel
                  disabled={viewMode}
                  control={
                    <Checkbox
                      checked={!Boolean(corridorCategory.traps)}
                      onChange={handleTrapDefaultChange}
                      name="useDefault"
                      color="default"
                    />
                  }
                  label="Use Default"
                />
              }
            </div>
            <ProbabilityNameList
              showProbs
              disableProbs={viewMode}
              showDelete={!viewMode}
              disableListItem={viewMode && editMode}
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
              onProbUpdate={(newList: Probabilities<EntranceType> | null) => handleChange(nameOf<CorridorCategory>("entranceTypes"), newList)}
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
          exclude={corridorCategory.monsters ? corridorCategory.monsters.objects : []}
          onSelect={(m) => handleSelect(nameOf<CorridorCategory>("monsters"), m)}
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
          exclude={corridorCategory.items ? corridorCategory.items.objects : []}
          onSelect={(i) => handleSelect(nameOf<CorridorCategory>("items"), i)}
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
          exclude={corridorCategory.traps ? corridorCategory.traps.objects : []}
          onSelect={(i) => handleSelect(nameOf<CorridorCategory>("traps"), i)}
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
      {/* {selectTileSetDialogOpen &&
        <SelectTileSet
          open={selectTileSetDialogOpen}
          exclude={corridorCategory.tileSets ? corridorCategory.tileSets.objects : []}
          onSelect={(i) => handleSelect(nameOf<CorridorCategory>("tileSets"), i)}
          onCancelClick={() => setSelectTileSetDialogOpen(false)}
        />
      } */}
    </div>
  );
}