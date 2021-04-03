import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  IconButton
} from '@material-ui/core';

import { RegionCategory } from '../models/RegionCategory';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        maxWidth: 752,
    },
    demo: {
        backgroundColor: theme.palette.background.paper,
    },
    title: {
        margin: theme.spacing(4, 0, 2),
    },
}));

type Props<T extends RegionCategory> = {
  list: T[];
  showDelete?: boolean;
  onClick?: (rc: T) => void;
  onDeleteClick?: (index: number) => void;
}

RegionCategoryList.defaultProps = {
  showDelete: false
}

function RegionCategoryList<T extends RegionCategory> (props: Props<T>) {

    const classes = useStyles();

    const listItems = props.list.map((rc: T, i: number) =>
      <ListItem button onClick={(e)=>props.onClick!(rc)} key={i}>
        <ListItemText
          primary={rc.name}
        />
        {props.showDelete &&
          <ListItemSecondaryAction>
            <IconButton onClick={()=>props.onDeleteClick!(i)} edge="end" aria-label="delete">
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        }
        
      </ListItem>
    );

    return (
      <div className={classes.root}>
        <div className={classes.demo}>
          <List dense>
            {listItems}
          </List>
        </div>
      </div>
    );

}

export default RegionCategoryList;