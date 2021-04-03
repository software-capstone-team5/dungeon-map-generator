import { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import RegionCategoryList from './RegionCategoryList';
import { RegionCategory } from '../models/RegionCategory';
import { nameOf } from '../utils/util';
import differenceBy from 'lodash/differenceBy';

type Props<T extends RegionCategory> = {
  open: boolean;
  exclude: T[];
  onSelect: (rc: T) => void;
  onCancelClick: () => void;
}

export default function SelectRegionCategory<T extends RegionCategory>(props: Props<T>) {
  const [regionCategories, setRegionCategories] = useState<T[]>([]);

  useEffect(()=> {
    // TODO: Make an API call to get the room categories
    // TEST DATA
    // var rc1 = new RegionCategory();
    // rc1.name = "Dining Hall";
    // var rc2 = new RegionCategory();
    // rc2.name = "Bedroom";
    // var apiList = [rc1, rc2]
    // apiList = differenceBy(apiList, props.exclude, nameOf<RegionCategory>("name"));
    // setRegionCategories(apiList);
  });

  return (
    <div>
      <Dialog 
        open={props.open}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Select TODO</DialogTitle>
        <DialogContent>
          <RegionCategoryList<T> list={regionCategories} onClick={(rc: T) => props.onSelect(rc)}></RegionCategoryList>
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