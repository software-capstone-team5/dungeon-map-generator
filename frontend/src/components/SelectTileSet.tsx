import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useState } from 'react';
// import differenceWith from 'lodash/differenceWith';
// import { useEffect, useState } from 'react';
// import DB from '../DB';
import { TileSet } from '../models/TileSet';
// import { compareByName } from '../utils/util';
import NameList from './common/NameList';

type Props = {
  open: boolean;
  exclude: TileSet[];
  onSelect: (m: TileSet) => void;
  onCancelClick: () => void;
}

export default function SelectTileSet(props: Props) {
  const [tileSets, setTileSets] = useState<TileSet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   let mounted = true;
  //   setIsLoading(true);
  //   DB.getAllTileSets().then(result => {
  //     if (mounted) {
  //       setIsLoading(false);
  //       if (result && result.valid) {
  //         var list = differenceWith(result.response, props.exclude, compareByName) as TileSet[]
  //         list.unshift(TileSet.getDefault())
  //         setTileSets(list)
  //       }
  //     }
  //   })
  //   return () => { mounted = false };
  // }, []);

  return (
    <div>
      <Dialog
        open={props.open}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Select Tile Set</DialogTitle>
        <DialogContent>
          {isLoading && 
            <div style={{textAlign: "center"}}>
              <CircularProgress/>
            </div>
          }
          <NameList<TileSet> list={tileSets} onClick={(tileSet: TileSet) => props.onSelect(tileSet)}></NameList>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onCancelClick} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}