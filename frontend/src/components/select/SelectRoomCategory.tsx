// REQ-16: Edit.RegionLevelConfiguration.RoomCategories

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import differenceWith from 'lodash/differenceWith';
import { useEffect, useState } from 'react';
import DB from '../../DB';
import { RoomCategory } from '../../models/RoomCategory';
import { compareByID } from '../../utils/util';
import NameList from '../common/NameList';
import RoomCategoryEditor from '../RoomCategoryEditor';

type Props = {
  open: boolean;
  exclude: RoomCategory[];
  onlyAllowDefaults?: boolean;
  onSelect: (rc: RoomCategory) => void;
  onCancelClick: () => void;
}

SelectRoomCategory.defaultProps = {
  onlyAllowDefaults: false
}

export default function SelectRoomCategory(props: Props) {
  const [roomCategories, setRoomCategories] = useState<RoomCategory[]>([]);
  const [roomEditorOpen, setRoomEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    DB.getAllRoomCat().then(result => {
      if (mounted) {
        setIsLoading(false);
        if (result && result.valid) {
          var list = differenceWith(result.response, props.exclude, compareByID) as RoomCategory[]
          if (props.onlyAllowDefaults) {
            list = list.filter(rc => rc.canBeUsedAsDefault())
          }
          setRoomCategories(list)
        }
      }
    })
    return () => {mounted = false};
  }, []);

  const handleSave = (rc: RoomCategory) => {
    setRoomEditorOpen(false);
    props.onSelect(rc);
  }

  return (
    <div>
      <Dialog 
        open={props.open}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Select {props.onlyAllowDefaults ? "Default" : ""} Room Category</DialogTitle>
        <DialogContent>
          {isLoading && 
            <div style={{textAlign: "center"}}>
              <CircularProgress/>
            </div>
          }
          <NameList<RoomCategory> list={roomCategories} onClick={(rc: RoomCategory) => props.onSelect(rc)}></NameList>
          <Button onClick={()=>setRoomEditorOpen(true)} variant="outlined" style={{width: "100%"}} color="primary">
            Add New
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onCancelClick} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      {roomEditorOpen &&
          <RoomCategoryEditor
              open={roomEditorOpen}
              onSave={handleSave}
              onCancelClick={()=>setRoomEditorOpen(false)}
          />
      }
    </div>
  );
}