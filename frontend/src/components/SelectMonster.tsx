import { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import NameList from './common/NameList';
import MonsterEditor from './MonsterEditor';
import { Monster } from '../models/Monster';
import { nameOf } from '../utils/util';
import differenceBy from 'lodash/differenceBy';

type Props = {
  open: boolean;
  exclude: Monster[];
  onSelect: (m: Monster) => void;
  onCancelClick: () => void;
}

export default function SelectMonster(props: Props) {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [monsterEditorOpen, setMonsterEditorOpen] = useState(false);

  // useEffect(()=> {
  //   // TODO: Make an API call to get the monster 
  //   // TEST DATA
  //   var m = new Monster();
  //   m.id = "11";
  //   m.name = "Dragon";
  //   var m2 = new Monster();
  //   m2.id = "10";
  //   m2.name = "Owlbear";
  //   var apiList = [m, m2]
  //   apiList = differenceBy(apiList, props.exclude, nameOf<Monster>("id"));
  //   setMonsters(apiList);
  // }, [monsters, props.exclude]);

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
          <NameList<Monster> list={monsters} onClick={(m: Monster) => props.onSelect(m)}></NameList>
          <Button onClick={()=>setMonsterEditorOpen(true)} variant="outlined" style={{width: "100%"}} color="primary">
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
              onCancelClick={()=>setMonsterEditorOpen(false)}
          />
      }
    </div>
  );
}