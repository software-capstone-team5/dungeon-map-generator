import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import differenceWith from 'lodash/differenceWith';
import { useEffect, useState } from 'react';
import DB from '../DB';
import { Configuration } from '../models/Configuration';
import { compareByID } from '../utils/util';
import NameList from './common/NameList';

type Props = {
  open: boolean;
  exclude: Configuration[];
  onSelect: (id: string, premade: boolean) => void;
  onCancelClick: () => void;
}

export default function SelectConfiguration(props: Props) {
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    DB.getAllConfig().then(result => {
      if (mounted) {
        setIsLoading(false);
        if (result && result.valid) {
          var list = differenceWith(result.response, props.exclude, compareByID) as Configuration[]
          setConfigurations(list)
        }
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
          {isLoading && 
            <div style={{textAlign: "center"}}>
              <CircularProgress/>
            </div>
          }
          <NameList<Configuration> list={configurations} onClick={(c: Configuration) => props.onSelect(c.id, c.premade)}></NameList>
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