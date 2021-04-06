import { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import NameList from './common/NameList';
import RoomCategoryEditor from './RoomCategoryEditor';
import { RoomCategory } from '../models/RoomCategory';
import { nameOf } from '../utils/util';
import differenceBy from 'lodash/differenceBy';

type Props = {
  open: boolean;
  exclude: RoomCategory[];
  onSelect: (rc: RoomCategory) => void;
  onCancelClick: () => void;
}

export default function SelectRoomCategory(props: Props) {
  const [roomCategories, setRoomCategories] = useState<RoomCategory[]>([]);
  const [roomEditorOpen, setRoomEditorOpen] = useState(false);

  useEffect(()=> {
    // TODO: Make an API call to get the room categories
    // TEST DATA
    // var rc1 = new RoomCategory();
    // rc1.id = "11";
    // rc1.name = "Dining Hall";
    // var rc2 = new RoomCategory();
    // rc2.id = "10";
    // rc2.name = "Bedroom";
    // var apiList = [rc1, rc2]
    // apiList = differenceBy(apiList, props.exclude, nameOf<RoomCategory>("id"));
    // setRoomCategories(apiList);
  });

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
        <DialogTitle id="form-dialog-title">Select Room Category</DialogTitle>
        <DialogContent>
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