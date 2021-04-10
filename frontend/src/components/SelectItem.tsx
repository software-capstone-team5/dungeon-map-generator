import { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import NameList from './common/NameList';
import ItemEditor from './ItemEditor';
import { Item } from '../models/Item';
import { compareByID } from '../utils/util';
import differenceWith from 'lodash/differenceWith';
import DB from '../DB';

type Props = {
  open: boolean;
  exclude: Item[];
  onSelect: (item: Item) => void;
  onCancelClick: () => void;
}

export default function SelectItem(props: Props) {
  const [Items, setItems] = useState<Item[]>([]);
  const [ItemEditorOpen, setItemEditorOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    // TODO: add a loading thing
    DB.getAllItems().then(result => {
      if (result && result.valid && mounted) {
        var list = differenceWith(result.response, props.exclude, compareByID) as Item[]
        setItems(list)
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