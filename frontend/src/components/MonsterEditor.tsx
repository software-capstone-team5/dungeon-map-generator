import { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import EditIcon from '@material-ui/icons/Edit';

import { Typography, IconButton, makeStyles, Slider} from '@material-ui/core';
import { Monster } from '../models/Monster';
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
  monster?: Monster;
  onCancelClick: ()=>void;
  onSave?: (rc: Monster) => void;
}

type Errors = {
  name: boolean;
}

MonsterEditor.defaultProps = {
  viewOnly: false
}

export default function MonsterEditor(props: Props) {
  const editMode: boolean = props.monster !== undefined
  const classes = useStyles();
  
  const [viewMode, setViewMode] = useState(props.viewOnly);
  const [errors, setErrors] = useState<Errors>({
    name: false
  });
  const [monster, setMonster] = useState<Monster>(() => {
    if (props.monster !== undefined) {
      return cloneDeep(props.monster);
    } else {
      return new Monster();
    }
  });
 
  const handleChange = (name: keyof Monster, value: valueOf<Monster>) => {
    if (name === nameOf<Monster>("name")){
      if (value) {
        setErrors({
          ...errors,
          name: false
        })
      }
    }
    setMonster(Object.assign({}, monster, { [name]: value }) );
  }

  const handleEditClick = () => {
    setViewMode(false);
  }

  const handleSaveClick = () => {
    if (!monster.name) {
      return;
    }
    // TODO: Make call to backend
    props.onSave!(monster);
  }

  const handleNameBlur = () => {
    if (!monster.name) {
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
          <Typography component={'span'} variant="h6">{editMode ? "Edit": "Add"} Monster</Typography>
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
              value={monster.name}
              onChange={(e)=>handleChange(nameOf<Monster>("name"), e.target.value)}
            />
            <TextField
              disabled={viewMode}
              variant="outlined"
              // margin="dense"
              label="Description"
              multiline
              rows={4}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              value={monster.description}
              onChange={(e)=>handleChange(nameOf<Monster>("description"), e.target.value)}
            />
            <Typography id="challenge-slider" gutterBottom>
                Challenge Rating
            </Typography>
            <Slider
                aria-labelledby="challenge-slider"
                disabled={viewMode}
                value={monster.challenge}
                onChange={(e,v) => handleChange(nameOf<Monster>("challenge"), v as number)}
                valueLabelDisplay="auto"
                step={1}
                marks
                min={Monster.minChallenge}
                max={Monster.maxChallenge}
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