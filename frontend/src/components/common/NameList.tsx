import {
  IconButton, List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';


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
  disabled?: boolean;
  showDelete?: boolean;
  onClick?: (item: T) => void;
  onDeleteClick?: (index: number) => void;
}

NameList.defaultProps = {
  showDelete: false,
  disabled: false,
}

function NameList<T extends hasName> (props: Props<T>) {

    const classes = useStyles();

    const handleClick = (item: T) => {
      if (props.onClick && !props.disabled) {
        props.onClick(item)
      }
    }

    const listItems = props.list.map((item: T, i: number) =>
      <ListItem disabled={props.disabled} button={(!props.disabled) as true} onClick={(e)=>handleClick(item)} key={i}>
        <ListItemText
          primary={item.name}
        />
        {props.showDelete &&
          <ListItemSecondaryAction>
            <IconButton disabled={props.disabled} onClick={()=>props.onDeleteClick!(i)} edge="end" aria-label="delete">
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