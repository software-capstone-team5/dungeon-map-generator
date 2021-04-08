import { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import EditIcon from '@material-ui/icons/Edit';

import { Typography, IconButton, makeStyles, Slider} from '@material-ui/core';
import { Item } from '../models/Item';
import { nameOf, valueOf } from '../utils/util';
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

type Props = {
  open: boolean;
  viewOnly?: boolean;
  item?: Item;
  onCancelClick: ()=>void;
  onSave?: (item: Item) => void;
}

ItemEditor.defaultProps = {
  viewOnly: false
}

export default function ItemEditor(props: Props) {
  const editMode: boolean = props.item !== undefined
  
  var initialItem: Item;
  if (props.item !== undefined) {
    initialItem = cloneDeep(props.item);
  } else {
    initialItem = new Item();
  }

  const classes = useStyles();
  //TODO: Set to 0 so basic is default, do it when basic is complete
  const [item, setItem] = useState(initialItem);
  const [viewMode, setViewMode] = useState(props.viewOnly);

  const handleChange = (name: keyof Item, value: valueOf<Item>) => {
    setItem(Object.assign({}, item, { [name]: value }) );
  }

  const handleEditClick = () => {
    setViewMode(false);
  }

  const handleSaveClick = () => {
    // TODO: Make call to backend
    props.onSave!(item);
  }

  return (
    <div>
      <Dialog open={props.open} aria-labelledby="form-dialog-title">
        <DialogTitle
          className={classes.root}
          disableTypography
          id="form-dialog-title">
          <Typography component={'span'} variant="h6">{editMode ? "Edit": "Add"} Item</Typography>
          {viewMode && editMode &&
            <IconButton aria-label="edit" className={classes.editButton} onClick={handleEditClick}>
              <EditIcon />
            </IconButton>
          }
        </DialogTitle>
        <DialogContent>
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
              value={item.name}
              onChange={(e)=>handleChange(nameOf<Item>("name"), e.target.value)}
            />
            <TextField
              disabled={viewMode}
              type="number"
              variant="outlined"
              margin="dense"
              id="value"
              label="Value"
              InputLabelProps={{
                shrink: true,
              }}
              value={item.value}
              onChange={(e)=>handleChange(nameOf<Item>("value"), parseFloat(e.target.value))}
            />
            <TextField
              disabled={viewMode}
              variant="outlined"
              margin="dense"
              label="Description"
              multiline
              rows={4}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              value={item.description}
              onChange={(e)=>handleChange(nameOf<Item>("description"), e.target.value)}
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
    </div>
  );
}