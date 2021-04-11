import { FormLabel, IconButton, makeStyles, Slider, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import EditIcon from '@material-ui/icons/Edit';
import cloneDeep from 'lodash/cloneDeep';
import { useState } from 'react';
import { Authenticator } from '../Authenticator';
import { DB } from '../DB';
import { Trap } from '../models/Trap';
import { nameOf, valueOf } from '../utils/util';



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
}));

type Props = {
  open: boolean;
  viewOnly?: boolean;
  trap?: Trap;
  onCancelClick: () => void;
  onSave?: (trap: Trap) => void;
}

type Errors = {
  name: boolean;
}

TrapEditor.defaultProps = {
  viewOnly: false
}

export default function TrapEditor(props: Props) {
  const editMode: boolean = props.trap !== undefined && !props.trap.premade;
  const classes = useStyles();

  const [viewMode, setViewMode] = useState(props.viewOnly);
  const [errors, setErrors] = useState<Errors>({
    name: false
  });
  const [trap, setTrap] = useState<Trap>(() => {
    if (props.trap !== undefined) {
      return cloneDeep(props.trap);
    } else {
      return new Trap();
    }
  });

  const handleChange = (name: keyof Trap, value: valueOf<Trap>) => {
    if (name === nameOf<Trap>("name")) {
      if (value) {
        setErrors({
          ...errors,
          name: false
        })
      }
    }
    setTrap(Object.assign(Object.create(Object.getPrototypeOf(trap)), trap, { [name]: value }));
  }

  const handleEditClick = () => {
    setViewMode(false);
  }

  const handleSaveClick = async () => {
    if (!trap.name) {
      return;
    }

    if (Authenticator.isLoggedIn()) {
      var result = await DB.saveTrap(trap);
      if (result && result.valid) {
        var id = result.response;
        trap.id = id;
      } else {
        if (result) {
          window.alert(result.response);
        }
      }
    }

    props.onSave!(trap);
  }

  const handleNameBlur = () => {
    if (!trap.name) {
      setErrors({
        ...errors,
        name: true
      })
    }
  }

  return (
    <div>
      <Dialog open={props.open} aria-labelledby="form-dialog-title">
        <DialogTitle
          className={classes.root}
          disableTypography
          id="form-dialog-title">
          <Typography component={'span'} variant="h6">{editMode ? "Edit" : viewMode ? "View" : "Add"} Trap</Typography>
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
            value={trap.name}
            onChange={(e) => handleChange(nameOf<Trap>("name"), e.target.value)}
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
            onChange={(e) => handleChange(nameOf<Trap>("description"), e.target.value)}
          />
          <FormLabel id="challenge-slider">
            Difficulty Challenge
            </FormLabel>
          <Slider
            aria-labelledby="challenge-slider"
            disabled={viewMode}
            value={trap.difficulty}
            onChange={(e, v) => handleChange(nameOf<Trap>("difficulty"), v as number)}
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