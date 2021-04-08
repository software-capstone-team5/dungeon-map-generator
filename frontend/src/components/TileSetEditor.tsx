import { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import EditIcon from '@material-ui/icons/Edit';

import { Typography, IconButton, makeStyles, Slider} from '@material-ui/core';
import { TileSet } from '../models/TileSet';
import { nameOf, valueOf } from '../utils/util';
import cloneDeep from 'lodash/cloneDeep';
import TileUploader from './TileUploader';


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
  tileSet?: TileSet;
  onCancelClick: ()=>void;
  onSave?: (rc: TileSet) => void;
}

TileSetEditor.defaultProps = {
  viewOnly: false
}

export default function TileSetEditor(props: Props) {
  const editMode: boolean = props.tileSet !== undefined
  
  var initialTileSet: TileSet;
  if (props.tileSet !== undefined) {
    initialTileSet = cloneDeep(props.tileSet);
  } else {
    initialTileSet = new TileSet();
  }

  const classes = useStyles();
  //TODO: Set to 0 so basic is default, do it when basic is complete
  const [tileSet, setTileSet] = useState(initialTileSet);
  const [viewMode, setViewMode] = useState(props.viewOnly);

  const handleChange = (name: keyof TileSet, value: valueOf<TileSet>) => {
    setTileSet(Object.assign({}, tileSet, { [name]: value }) );
  }

  const handleEditClick = () => {
    setViewMode(false);
  }

  const handleSaveClick = () => {
    // TODO: Make call to backend
    props.onSave!(tileSet);
  }

  return (
    <div>
      <Dialog open={props.open} aria-labelledby="form-dialog-title">
        <DialogTitle
          className={classes.root}
          disableTypography
          id="form-dialog-title">
          <Typography component={'span'} variant="h6">{editMode ? "Edit": "Add"} Tile Set</Typography>
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
              value={tileSet.name}
              onChange={(e)=>handleChange(nameOf<TileSet>("name"), e.target.value)}
          />
          <TileUploader tileSet={props.tileSet}/>
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