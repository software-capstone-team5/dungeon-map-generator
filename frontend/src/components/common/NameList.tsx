import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  IconButton
} from '@material-ui/core';


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

interface hasName {
  name: string;
}

type Props<T extends hasName> = {
  list: T[];
  showDelete?: boolean;
  onClick?: (item: T) => void;
  onDeleteClick?: (index: number) => void;
}

NameList.defaultProps = {
  showDelete: false
}

function NameList<T extends hasName> (props: Props<T>) {

    const classes = useStyles();

    const listItems = props.list.map((item: T, i: number) =>
      <ListItem button onClick={(e)=>props.onClick!(item)} key={i}>
        <ListItemText
          primary={item.name}
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

export default NameList;