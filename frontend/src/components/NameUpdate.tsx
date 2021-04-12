import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


type Props = {
    open: boolean;
    oldName?: string
    onNameConfirm: (name: string) => void;
    onCancel: () => void;
}

export default function FormDialog(props: Props) {
  const [name, setName] = React.useState(()=>{
      if (props.oldName !== undefined) {
        return props.oldName;
      } else {
        return "";
      }
  })

  const handleConfirm = () => {
    if (name) {
        props.onNameConfirm(name);
    }
  };


  return (
    <div>
      <Dialog open={props.open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{props.oldName ? "Update" : "New"} Configuration</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {props.oldName ? "Update name for this configuration?" : "Give a name to this configuration."}
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            label="Name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}