import { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import NameList from './common/NameList';
import CorridorCategoryEditor from './CorridorCategoryEditor';
import { CorridorCategory } from '../models/CorridorCategory';
import { compareByID } from '../utils/util';
import differenceWith from 'lodash/differenceWith';
import DB from '../DB';

type Props = {
  open: boolean;
  exclude: CorridorCategory[];
  onSelect: (rc: CorridorCategory) => void;
  onCancelClick: () => void;
}

export default function SelectCorridorCategory(props: Props) {
  const [corridorCategories, setCorridorCategories] = useState<CorridorCategory[]>([]);
  const [corridorEditorOpen, setCorridorEditorOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    // TODO: add a loading thing
    DB.getAllCorridorCat().then(result =>{
      if (result.valid && mounted) {
        var list = differenceWith(result.response, props.exclude, compareByID) as CorridorCategory[]
        setCorridorCategories(list)
      }
    })
    return () => {mounted = false};
  }, []);

  const handleSave = (cc: CorridorCategory) => {
    setCorridorEditorOpen(false);
    props.onSelect(cc);
  }

  return (
    <div>
      <Dialog 
        open={props.open}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Select Corridor Category</DialogTitle>
        <DialogContent>
          <NameList<CorridorCategory> list={corridorCategories} onClick={(rc: CorridorCategory) => props.onSelect(rc)}></NameList>
          <Button onClick={()=>setCorridorEditorOpen(true)} variant="outlined" style={{width: "100%"}} color="primary">
            Add New
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onCancelClick} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      {corridorEditorOpen &&
          <CorridorCategoryEditor
              open={corridorEditorOpen}
              onSave={handleSave}
              onCancelClick={()=>setCorridorEditorOpen(false)}
          />
      }
    </div>
  );
}