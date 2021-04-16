import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import EditIcon from '@material-ui/icons/Edit';
import cloneDeep from 'lodash/cloneDeep';
import { useState } from 'react';
import { Authenticator } from '../../Authenticator';
import { DB } from '../../DB';
import { Item } from '../../models/Item';
import { nameOf, valueOf } from '../../utils/util';

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
  item?: Item;
  onCancelClick: () => void;
  onSave?: (item: Item) => void;
}

type Errors = {
  name: boolean;
  value: boolean;
}

ItemEditor.defaultProps = {
  viewOnly: false
}

export default function ItemEditor(props: Props) {
  const editMode: boolean = props.item !== undefined && !props.item.premade;
  const classes = useStyles();

  const [viewMode, setViewMode] = useState(props.viewOnly);
  const [errors, setErrors] = useState<Errors>({
    name: false,
    value: false
  });
  const [item, setItem] = useState<Item>(() => {
    if (props.item !== undefined) {
      return cloneDeep(props.item);
    } else {
      return new Item();
    }
  });

  const handleChange = (name: keyof Item, value: valueOf<Item>) => {
    if (name === nameOf<Item>("name")) {
      if (value) {
        setErrors({
          ...errors,
          name: false
        })
      }
    } else if (name === nameOf<Item>("value")) {
      if (value < 1) {
        return
      } else if (!Number.isNaN(value)) {
        setErrors({
          ...errors,
          value: false
        })
      }
    }
    setItem(Object.assign(Object.create(Object.getPrototypeOf(item)), item, { [name]: value }));
  }

  const handleEditClick = () => {
    setViewMode(false);
  }

  const handleSaveClick = async () => {
    if (!item.name || item.value < 1 || Number.isNaN(item.value)) {
      return;
    }

    if (Authenticator.isLoggedIn()) {
      var result = await DB.saveItem(item);
      if (result && result.valid) {
        var id = result.response;
        item.id = id;
      } else {
        if (result) {
          window.alert(result.response);
        }
      }
    }

    props.onSave!(item);
  }

  const handleNameBlur = () => {
    if (!item.name) {
      setErrors({
        ...errors,
        name: true
      })
    }
  }

  const handleValueBlur = () => {
    if (Number.isNaN(item.value)) {
      setErrors({
        ...errors,
        value: true,
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
          <Typography component={'span'} variant="h6">{editMode ? "Edit" : viewMode ? "View" : "Add"} Item</Typography>
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
            value={item.name}
            onChange={(e) => handleChange(nameOf<Item>("name"), e.target.value)}
          />
          <TextField
            required
            error={errors.value}
            onBlur={handleValueBlur}
            disabled={viewMode}
            type="number"
            variant="outlined"
            margin="dense"
            id="value"
            label="Value"
            InputLabelProps={{
              shrink: true,
            }}
            value={Number.isNaN(item.value) ? "" : item.value}
            onChange={(e) => handleChange(nameOf<Item>("value"), parseFloat(e.target.value))}
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
            onChange={(e) => handleChange(nameOf<Item>("description"), e.target.value)}
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