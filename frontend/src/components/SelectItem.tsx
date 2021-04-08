import { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import NameList from './common/NameList';
import ItemEditor from './ItemEditor';
import { Item } from '../models/Item';
import { nameOf } from '../utils/util';
import differenceBy from 'lodash/differenceBy';

type Props = {
  open: boolean;
  exclude: Item[];
  onSelect: (item: Item) => void;
  onCancelClick: () => void;
}

export default function SelectItem(props: Props) {
  const [Items, setItems] = useState<Item[]>([]);
  const [ItemEditorOpen, setItemEditorOpen] = useState(false);

  // useEffect(()=> {
  //   // TODO: Make an API call to get the Item 
  //   // TEST DATA
  //   var m = new Item();
  //   m.id = "11";
  //   m.name = "Dragon";
  //   var m2 = new Item();
  //   m2.id = "10";
  //   m2.name = "Owlbear";
  //   var apiList = [m, m2]
  //   apiList = differenceBy(apiList, props.exclude, nameOf<Item>("id"));
  //   setItems(apiList);
  // }, [Items, props.exclude]);

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
          <Button onClick={()=>setItemEditorOpen(true)} variant="outlined" style={{width: "100%"}} color="primary">
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
              onCancelClick={()=>setItemEditorOpen(false)}
          />
      }
    </div>
  );
}