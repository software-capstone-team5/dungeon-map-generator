// REQ-24: Edit.RoomCategory.Items
// REQ-33: Edit.CorridorCategory.Items

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import differenceWith from 'lodash/differenceWith';
import { useEffect, useState } from 'react';
import DB from '../../DB';
import { Item } from '../../models/Item';
import { compareByID } from '../../utils/util';
import NameList from '../common/NameList';
import ItemEditor from '../ItemEditor';

type Props = {
  open: boolean;
  exclude: Item[];
  onSelect: (item: Item) => void;
  onCancelClick: () => void;
}

export default function SelectItem(props: Props) {
  const [Items, setItems] = useState<Item[]>([]);
  const [ItemEditorOpen, setItemEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    DB.getAllItems().then(result => {
      if (mounted) {
        setIsLoading(false);
        if (result && result.valid) {
          var list = differenceWith(result.response, props.exclude, compareByID) as Item[]
          setItems(list)
        }
      }
    })
    return () => { mounted = false };
  }, []);

  const handleSave = (item: Item) => {
    setItemEditorOpen(false);
    props.onSelect(item);
  }

  return (
    <div>
      <Dialog
        open={props.open}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Select Item</DialogTitle>
        <DialogContent>
          {isLoading && 
            <div style={{textAlign: "center"}}>
              <CircularProgress/>
            </div>
          }
          <NameList<Item> list={Items} onClick={(item: Item) => props.onSelect(item)}></NameList>
          <Button onClick={() => setItemEditorOpen(true)} variant="outlined" style={{ width: "100%" }} color="primary">
            Add New
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onCancelClick} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      {ItemEditorOpen &&
        <ItemEditor
          open={ItemEditorOpen}
          onSave={handleSave}
          onCancelClick={() => setItemEditorOpen(false)}
        />
      }
    </div>
  );
}