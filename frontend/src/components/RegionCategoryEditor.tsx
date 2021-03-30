import { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import { Size } from "../constants/Size";
import { AppBar, Tab, Tabs, Box, Typography} from '@material-ui/core';
import EnumProbabilityText from './common/EnumProbabilityText';
import { RoomCategory } from '../models/RoomCategory';
import { nameOf, valueOf } from '../utils/util';
import { Probabilities } from '../generator/Probabilities';

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function TabPanel(props) {
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
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

type Props = {
  open: boolean;
  roomCategory?: RoomCategory;
}

export default function RegionCategoryEditor(props: Props) {

  var initialRoomCategory: RoomCategory;
  if (props.roomCategory !== undefined) {
    initialRoomCategory = props.roomCategory
  } else {
    initialRoomCategory = new RoomCategory();
  }

  //TODO: Set to 0 so basic is default, do it when basic is complete
  const [tab, setTab] = useState(1);
  const [roomCategory, setRoomCategory] = useState(initialRoomCategory);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleClose = () => {
    // setOpen(false);
  };

  const handleChange = (name: keyof RoomCategory, value: valueOf<RoomCategory>) => {
    setRoomCategory(Object.assign({}, roomCategory, { [name]: value }) );
  }

  const handleProbUpdate = (name: keyof RoomCategory, key: any, newValue: number) => {
    var updatedList = (roomCategory[name]) as Probabilities<any>;
    updatedList.update(key, newValue);
    handleChange(name, updatedList);
  }

  return (
    <div>
      <Dialog open={props.open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Add Room Type</DialogTitle>
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
              variant="outlined"
              autoFocus
              margin="dense"
              id="name"
              label="Name"
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
            <EnumProbabilityText<Size> enum={Size} label="Size" probs={roomCategory.sizes} callbackPropertyName={nameOf<RoomCategory>("sizes")} onProbUpdate={handleProbUpdate}/>
        </TabPanel>
          {/* <DialogContentText>
            To subscribe to this website, please enter your email address here. We will send updates
            occasionally.
          </DialogContentText> */}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClose} color="primary">
            Subscribe
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}