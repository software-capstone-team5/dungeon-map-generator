import { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import EditIcon from '@material-ui/icons/Edit';

import { AppBar, Tab, Tabs, Box, Typography, IconButton, makeStyles} from '@material-ui/core';
import EnumProbabilityText from './common/EnumProbabilityText';
import { CorridorCategory } from '../models/CorridorCategory';
import { nameOf, valueOf } from '../utils/util';
import { Probabilities } from '../generator/Probabilities';
import { MonsterState } from '../constants/MonsterState';
import { EntranceType } from '../constants/EntranceType';
import { CorridorWidth } from '../constants/CorridorWidth';

import cloneDeep from 'lodash/cloneDeep';


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
  onCancelClick: ()=>void;
  onSave?: (rc: CorridorCategory) => void;
}

CorridorCategoryEditor.defaultProps = {
  viewOnly: false
}

export default function CorridorCategoryEditor(props: Props) {
  const editMode: boolean = props.corridorCategory !== undefined
  
  var initialCorridorCategory: CorridorCategory;
  if (props.corridorCategory !== undefined) {
    initialCorridorCategory = cloneDeep(props.corridorCategory);
  } else {
    initialCorridorCategory = new CorridorCategory();
  }

  const classes = useStyles();
  //TODO: Set to 0 so basic is default, do it when basic is complete
  const [tab, setTab] = useState(1);
  const [corridorCategory, setCorridorCategory] = useState(initialCorridorCategory);
  const [viewMode, setViewMode] = useState(props.viewOnly);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };

  const handleChange = (name: keyof CorridorCategory, value: valueOf<CorridorCategory>) => {
    setCorridorCategory(Object.assign({}, corridorCategory, { [name]: value }) );
  }

  const handleProbUpdate = (name: keyof CorridorCategory, key: any, newValue: number) => {
    var updatedList = (corridorCategory[name]) as Probabilities<any>;
    updatedList.update(key, newValue);
    handleChange(name, updatedList);
  }

  const handleEditClick = () => {
    setViewMode(false);
  }

  const handleSaveClick = () => {
    // TODO: Make call to backend
    props.onSave!(corridorCategory);
  }

  return (
    <div>
      <Dialog open={props.open} aria-labelledby="form-dialog-title">
        <DialogTitle
          className={classes.root}
          disableTypography
          id="form-dialog-title">
          <Typography component={'span'} variant="h6">{editMode ? "Edit": "Add"} Corridor Category</Typography>
          {viewMode &&
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
              value={corridorCategory.name}
              onChange={(e)=>handleChange(nameOf<CorridorCategory>("name"), e.target.value)}
            />
            <EnumProbabilityText<CorridorWidth>
              label="Corridor Width"
              enum={CorridorWidth}
              disabled={viewMode}
              probs={corridorCategory.widths}
              onProbUpdate={(enumChanged: CorridorWidth, newValue: number) => handleProbUpdate(nameOf<CorridorCategory>("widths"), enumChanged, newValue)}
            />
            {/* Tile assets
                monsters
                 */}
            <EnumProbabilityText<MonsterState>
              label="Monster State"
              enum={MonsterState}
              disabled={viewMode}
              probs={corridorCategory.states}
              onProbUpdate={(enumChanged: MonsterState, newValue: number) => handleProbUpdate(nameOf<CorridorCategory>("states"), enumChanged, newValue)}
            />
            {/* items
                traps
                 */}
            <EnumProbabilityText<EntranceType>
              label="Entrance Type"
              enum={EntranceType}
              disabled={viewMode}
              probs={corridorCategory.entranceTypes}
              onProbUpdate={(enumChanged: EntranceType, newValue: number) => handleProbUpdate(nameOf<CorridorCategory>("entranceTypes"), enumChanged, newValue)}
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
    </div>
  );
}