import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import differenceWith from 'lodash/differenceWith';
import { useEffect, useState } from 'react';
import DB from '../../DB';
import { Trap } from '../../models/Trap';
import { compareByID } from '../../utils/util';
import NameList from '../common/NameList';
import TrapEditor from '../TrapEditor';

type Props = {
  open: boolean;
  exclude: Trap[];
  onSelect: (m: Trap) => void;
  onCancelClick: () => void;
}

export default function SelectTrap(props: Props) {
  const [traps, setTraps] = useState<Trap[]>([]);
  const [trapEditorOpen, setTrapEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    DB.getAllTraps().then(result => {
      if (mounted) {
        setIsLoading(false);
        if (result && result.valid) {
          var list = differenceWith(result.response, props.exclude, compareByID) as Trap[]
          setTraps(list)
        }
      }
    })
    return () => { mounted = false };
  }, []);


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
          {isLoading && 
            <div style={{textAlign: "center"}}>
              <CircularProgress/>
            </div>
          }
          <NameList<Trap> list={traps} onClick={(trap: Trap) => props.onSelect(trap)}></NameList>
          <Button onClick={() => setTrapEditorOpen(true)} variant="outlined" style={{ width: "100%" }} color="primary">
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
          onCancelClick={() => setTrapEditorOpen(false)}
        />
      }
    </div>
  );
}