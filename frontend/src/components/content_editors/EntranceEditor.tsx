// REQ-54: Modify.DoorType - The type of any existing door can be changed. 

import { IconButton, makeStyles, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import EditIcon from '@material-ui/icons/Edit';
import cloneDeep from 'lodash/cloneDeep';
import { useState } from 'react';
import { EntranceType } from '../../constants/EntranceType';
import { Entrance } from '../../models/Entrance';
import { nameOf, valueOf } from '../../utils/util';
import EnumRadio from '../common/EnumRadio';

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
  entrance?: Entrance;
  onCancelClick: () => void;
  onSave?: (entrance: Entrance) => void;
}

EntranceEditor.defaultProps = {
  viewOnly: false
}

export default function EntranceEditor(props: Props) {
  const editMode: boolean = props.entrance !== undefined;
  const classes = useStyles();

  const [viewMode, setViewMode] = useState(props.viewOnly);
  const [entrance, setEntrance] = useState<Entrance>(() => {
    if (props.entrance !== undefined) {
      return cloneDeep(props.entrance);
    } else {
      return new Entrance();
    }
  });

  const handleChange = (name: keyof Entrance, value: valueOf<Entrance>) => {
    setEntrance(Object.assign(Object.create(Object.getPrototypeOf(entrance)), entrance, { [name]: value }));
  }

  const handleEditClick = () => {
    setViewMode(false);
  }

  const handleSaveClick = async () => {
    props.onSave!(entrance);
  }

  return (
    <div>
      <Dialog open={props.open} aria-labelledby="form-dialog-title">
        <DialogTitle
          className={classes.root}
          disableTypography
          id="form-dialog-title">
          <Typography component={'span'} variant="h6">{editMode ? "Edit" : viewMode ? "View" : "Add"} Entrance</Typography>
          {viewMode && editMode &&
            <IconButton aria-label="edit" className={classes.editButton} onClick={handleEditClick}>
              <EditIcon />
            </IconButton>
          }
        </DialogTitle>
        <DialogContent>
			<EnumRadio<EntranceType>
				label="Entrance Type"
				enum={EntranceType}
				value={entrance.type}
				disabled={viewMode}
				onChange={(value: EntranceType) => handleChange(nameOf<Entrance>("type"), value)}/>
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