import { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import EditIcon from '@material-ui/icons/Edit';

import { Typography, IconButton, makeStyles, Slider} from '@material-ui/core';
import { Trap } from '../models/Trap';
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
  trap?: Trap;
  onCancelClick: ()=>void;
  onSave?: (trap: Trap) => void;
}

TrapEditor.defaultProps = {
  viewOnly: false
}

export default function TrapEditor(props: Props) {
  const editMode: boolean = props.trap !== undefined
  
  var initialTrap: Trap;
  if (props.trap !== undefined) {
    initialTrap = cloneDeep(props.trap);
  } else {
    initialTrap = new Trap();
  }

  const classes = useStyles();
  //TODO: Set to 0 so basic is default, do it when basic is complete
  const [trap, setTrap] = useState(initialTrap);
  const [viewMode, setViewMode] = useState(props.viewOnly);

  const handleChange = (name: keyof Trap, value: valueOf<Trap>) => {
    setTrap(Object.assign({}, trap, { [name]: value }) );
  }

  const handleEditClick = () => {
    setViewMode(false);
  }

  const handleSaveClick = () => {
    // TODO: Make call to backend
    props.onSave!(trap);
  }

  return (
    <div>
      <Dialog open={props.open} aria-labelledby="form-dialog-title">
        <DialogTitle
          className={classes.root}
          disableTypography
          id="form-dialog-title">
          <Typography component={'span'} variant="h6">{editMode ? "Edit": "Add"} Trap</Typography>
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
              value={trap.name}
              onChange={(e)=>handleChange(nameOf<Trap>("name"), e.target.value)}
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
              value={trap.description}
              onChange={(e)=>handleChange(nameOf<Trap>("description"), e.target.value)}
            />
            <Typography id="challenge-slider" gutterBottom>
                Difficulty Challenge
            </Typography>
            <Slider
                aria-labelledby="challenge-slider"
                disabled={viewMode}
                value={trap.difficulty}
                onChange={(e,v) => handleChange(nameOf<Trap>("difficulty"), v as number)}
                valueLabelDisplay="auto"
                step={1}
                marks
                min={Trap.minDifficulty}
                max={Trap.maxDifficulty}
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