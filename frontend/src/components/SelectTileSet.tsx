import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useState } from 'react';
import { TileSet } from '../models/TileSet';
import NameList from './common/NameList';

type Props = {
  open: boolean;
  exclude: TileSet[];
  onSelect: (m: TileSet) => void;
  onCancelClick: () => void;
}

export default function SelectTileSet(props: Props) {
  const [tileSets, setTileSets] = useState<TileSet[]>([]);
  const [tileSetEditorOpen, setTileSetEditorOpen] = useState(false);

  // useEffect(()=> {
  //   // TODO: Make an API call to get the tileSet 
  //   // TEST DATA
  //   var m = new TileSet();
  //   m.id = "11";
  //   m.name = "Dragon";
  //   var m2 = new TileSet();
  //   m2.id = "10";
  //   m2.name = "Owlbear";
  //   var apiList = [m, m2]
  //   apiList = differenceBy(apiList, props.exclude, nameOf<TileSet>("id"));
  //   setTileSets(apiList);
  // }, [tileSets, props.exclude]);

  const handleSave = (tileSet: TileSet) => {
    setTileSetEditorOpen(false);
    props.onSelect(tileSet);
  }

  return (
    <div>
      <Dialog 
        open={props.open}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Select Tile Set</DialogTitle>
        <DialogContent>
          <NameList<TileSet> list={tileSets} onClick={(tileSet: TileSet) => props.onSelect(tileSet)}></NameList>
          <Button onClick={()=>setTileSetEditorOpen(true)} variant="outlined" style={{width: "100%"}} color="primary">
            Add New
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onCancelClick} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      {/* {tileSetEditorOpen &&
          <TileSetEditor
              open={tileSetEditorOpen}
              onSave={handleSave}
              onCancelClick={()=>setTileSetEditorOpen(false)}
          />
      } */}
    </div>
  );
}