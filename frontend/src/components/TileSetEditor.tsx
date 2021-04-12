import { makeStyles, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import { useState } from 'react';
import { TileSet } from '../models/TileSet';
import { nameOf, valueOf } from '../utils/util';
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
  onCancelClick: ()=>void;
  onSave?: (rc: TileSet) => void;
}

TileSetEditor.defaultProps = {
  viewOnly: false
}

export default function TileSetEditor(props: Props) {
  
  const classes = useStyles();
  const [tileSet, setTileSet] = useState(new TileSet("", 48, new Map()));

  const handleChange = (name: keyof TileSet, value: valueOf<TileSet>) => {
    setTileSet(Object.assign({}, tileSet, { [name]: value }) );
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
          <Typography component={'span'} variant="h6">Upload a Tile Set</Typography>
        </DialogTitle>
        <DialogContent>
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
              value={tileSet.name}
              onChange={(e)=>handleChange(nameOf<TileSet>("name"), e.target.value)}
          />
          <TileUploader/>
        </DialogContent>

        <DialogActions>
          <Button onClick={props.onCancelClick} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveClick} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}