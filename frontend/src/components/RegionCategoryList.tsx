import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  IconButton
} from '@material-ui/core';

import { Probabilities } from '../generator/Probabilities';
import { RegionCategory } from '../models/RegionCategory';
import { Configuration } from '../models/Configuration';


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

type Props = {
  list: Probabilities<RegionCategory>;
  callbackPropertyName: keyof Configuration;
  onDeleteClick: (name: keyof Configuration, index: number) => void;
}

function RegionCategoryList (props: Props) {
    const classes = useStyles();

    const listItems = props.list.objects.map((rc: RegionCategory, i: number) =>
      <ListItem button key={i}>
        <ListItemText
          primary={rc.name}
        />
        <ListItemSecondaryAction>
          <IconButton onClick={()=>props.onDeleteClick(props.callbackPropertyName, i)} edge="end" aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
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