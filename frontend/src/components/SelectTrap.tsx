import { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import NameList from './common/NameList';
import TrapEditor from './TrapEditor';
import { Trap } from '../models/Trap';
import { nameOf } from '../utils/util';
import differenceBy from 'lodash/differenceBy';

type Props = {
  open: boolean;
  exclude: Trap[];
  onSelect: (m: Trap) => void;
  onCancelClick: () => void;
}

export default function SelectTrap(props: Props) {
  const [traps, setTraps] = useState<Trap[]>([]);
  const [trapEditorOpen, setTrapEditorOpen] = useState(false);

  // useEffect(()=> {
  //   // TODO: Make an API call to get the trap 
  //   // TEST DATA
  //   var m = new Trap();
  //   m.id = "11";
  //   m.name = "Dragon";
  //   var m2 = new Trap();
  //   m2.id = "10";
  //   m2.name = "Owlbear";
  //   var apiList = [m, m2]
  //   apiList = differenceBy(apiList, props.exclude, nameOf<Trap>("id"));
  //   setTraps(apiList);
  // }, [traps, props.exclude]);

  const handleSave = (trap: Trap) => {
    setTrapEditorOpen(false);
    props.onSelect(trap);
  }

  return (
    <div>
      <Dialog 
        open={props.open}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Select Trap</DialogTitle>
        <DialogContent>
          <NameList<Trap> list={traps} onClick={(trap: Trap) => props.onSelect(trap)}></NameList>
          <Button onClick={()=>setTrapEditorOpen(true)} variant="outlined" style={{width: "100%"}} color="primary">
            Add New
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onCancelClick} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      {trapEditorOpen &&
          <TrapEditor
              open={trapEditorOpen}
              onSave={handleSave}
              onCancelClick={()=>setTrapEditorOpen(false)}
          />
      }
    </div>
  );
}