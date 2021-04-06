import { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import RegionCategoryList from './RegionCategoryList';
import CorridorCategoryEditor from './CorridorCategoryEditor';
import { CorridorCategory } from '../models/CorridorCategory';
import { nameOf } from '../utils/util';
import differenceBy from 'lodash/differenceBy';

type Props = {
  open: boolean;
  exclude: CorridorCategory[];
  onSelect: (rc: CorridorCategory) => void;
  onCancelClick: () => void;
}

export default function SelectCorridorCategory(props: Props) {
  const [corridorCategories, setCorridorCategories] = useState<CorridorCategory[]>([]);
  const [corridorEditorOpen, setCorridorEditorOpen] = useState(false);

  useEffect(()=> {
    // TODO: Make an API call to get the corridor categories
    // TEST DATA
    // var rc1 = new CorridorCategory();
    // rc1.id = "11";
    // rc1.name = "Dining Hall";
    // var rc2 = new CorridorCategory();
    // rc2.id = "10";
    // rc2.name = "Ugly hall";
    // var apiList = [rc1, rc2]
    // apiList = differenceBy(apiList, props.exclude, nameOf<CorridorCategory>("id"));
    // setCorridorCategories(apiList);
  });

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
          <RegionCategoryList<CorridorCategory> list={corridorCategories} onClick={(rc: CorridorCategory) => props.onSelect(rc)}></RegionCategoryList>
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