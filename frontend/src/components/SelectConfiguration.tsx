import { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import NameList from './common/NameList';
import { Configuration } from '../models/Configuration';
import { compareByID } from '../utils/util';
import differenceWith from 'lodash/differenceWith';
import DB from '../DB';

type Props = {
  open: boolean;
  exclude: Configuration[];
  onSelect: (c: Configuration) => void;
  onCancelClick: () => void;
}

export default function SelectConfiguration(props: Props) {
  const [configurations, setConfigurations] = useState<Configuration[]>([]);

  useEffect(() => {
    let mounted = true;
    // TODO: add a loading thing
    DB.getAllConfig().then(result =>{
      if (result && result.valid && mounted) {
        var list = differenceWith(result.response, props.exclude, compareByID) as Configuration[]
        setConfigurations(list)
      }
    })
    return () => {mounted = false};
  }, []);

  return (
    <div>
      <Dialog 
        open={props.open}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Select Configuration</DialogTitle>
        <DialogContent>
          <NameList<Configuration> list={configurations} onClick={(c: Configuration) => props.onSelect(c)}></NameList>
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