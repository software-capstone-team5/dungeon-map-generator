import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import differenceWith from 'lodash/differenceWith';
import { useEffect, useState } from 'react';
import DB from '../../DB';
import { Monster } from '../../models/Monster';
import { compareByID } from '../../utils/util';
import NameList from '../common/NameList';
import MonsterEditor from '../MonsterEditor';

type Props = {
  open: boolean;
  exclude: Monster[];
  onSelect: (m: Monster) => void;
  onCancelClick: () => void;
}

export default function SelectMonster(props: Props) {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [monsterEditorOpen, setMonsterEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    DB.getAllMonsters().then(result => {
      if (mounted) {
        setIsLoading(false);
        if (result && result.valid) {
          var list = differenceWith(result.response, props.exclude, compareByID) as Monster[]
          setMonsters(list)
        }
      }
    })
    return () => { mounted = false };
  }, []);

  const handleSave = (cc: Monster) => {
    setMonsterEditorOpen(false);
    props.onSelect(cc);
  }

  return (
    <div>
      <Dialog
        open={props.open}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Select Monster</DialogTitle>
        <DialogContent>
          {isLoading && 
            <div style={{textAlign: "center"}}>
              <CircularProgress/>
            </div>
          }
          <NameList<Monster> list={monsters} onClick={(m: Monster) => props.onSelect(m)}></NameList>
          <Button onClick={() => setMonsterEditorOpen(true)} variant="outlined" style={{ width: "100%" }} color="primary">
            Add New
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onCancelClick} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      {monsterEditorOpen &&
        <MonsterEditor
          open={monsterEditorOpen}
          onSave={handleSave}
          onCancelClick={() => setMonsterEditorOpen(false)}
        />
      }
    </div>
  );
}