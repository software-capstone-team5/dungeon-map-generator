import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import differenceWith from 'lodash/differenceWith';
import { useEffect, useState } from 'react';
import DB from '../../DB';
import { CorridorCategory } from '../../models/CorridorCategory';
import { compareByID } from '../../utils/util';
import NameList from '../common/NameList';
import CorridorCategoryEditor from '../CorridorCategoryEditor';

type Props = {
  open: boolean;
  exclude: CorridorCategory[];
  onlyAllowDefaults: boolean;
  onSelect: (rc: CorridorCategory) => void;
  onCancelClick: () => void;
}

SelectCorridorCategory.defaultProps = {
  onlyAllowDefaults: false
}

export default function SelectCorridorCategory(props: Props) {
  const [corridorCategories, setCorridorCategories] = useState<CorridorCategory[]>([]);
  const [corridorEditorOpen, setCorridorEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    DB.getAllCorridorCat().then(result => {
      if (mounted) {
        setIsLoading(false)
        if (result && result.valid) {
          var list = differenceWith(result.response, props.exclude, compareByID) as CorridorCategory[]
          if (props.onlyAllowDefaults) {
            list = list.filter(rc => rc.canBeUsedAsDefault())
          }
          setCorridorCategories(list)
        }
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
        <DialogTitle id="form-dialog-title">Select {props.onlyAllowDefaults ? "Default" : ""} Corridor Category</DialogTitle>
        <DialogContent>
          {isLoading && 
            <div style={{textAlign: "center"}}>
              <CircularProgress/>
            </div>
          }
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