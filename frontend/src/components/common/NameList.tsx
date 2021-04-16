import {
  IconButton, List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import RefreshIcon from '@material-ui/icons/Refresh';
import AddIcon from '@material-ui/icons/Add';
import { useEffect, useState } from 'react';


const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        maxWidth: 752,
    },
    demo: {
        backgroundColor: theme.palette.background.paper,
        overflow: 'auto'
    },
    title: {
        margin: theme.spacing(4, 0, 2),
    },
}));

export interface hasName {
  name: string;
}

type Props<T extends hasName> = {
  list: T[];
  selectedIndex?: number;
  disabled?: boolean;
  showDelete?: boolean;
  showRegenerate?: boolean;
  showAdd?: boolean;
  showSelection?: boolean;
  onlyShowSelectedIcons?: boolean;
  doubleClick?: boolean;
  onClick?: (item: T) => void;
  onDeleteClick?: (index: number) => void;
  onRegenerateClick?: (index: number) => void;
  onAddClick?: (index: number) => void;
  onSelect?: (item: T, index: number) => void
}

NameList.defaultProps = {
  showDelete: false,
  showRegenerate: false,
  showAdd: false,
  disabled: false,
  selectedIndex: -1,
  doubleClick: false,
  onlyShowSelectedIcons: false,
}

function NameList<T extends hasName> (props: Props<T>) {
    const classes = useStyles();
    const [selectedIndex, setSelectedIndex] = useState(-1);

    useEffect( () => {
      if (props.showSelection){
        setSelectedIndex(props.selectedIndex ? props.selectedIndex : -1);
      }
      else{
        setSelectedIndex(-1);
      }
    }, [props.selectedIndex])

    const handleClick = (item: T, index: number) => {
      if (!props.disabled) {
        var isSame = (index === selectedIndex);
        setSelectedIndex(index);
        if (props.onClick && (!props.doubleClick || isSame)){
          props.onClick(item);
        }
        if (props.onSelect && (!isSame)){
          props.onSelect(item, index);
        }
      }
    }

    const listItems = props.list.map((item: T, i: number) =>
      <ListItem 
        selected={props.showSelection ? (selectedIndex === i) : false}
        disabled={props.disabled} 
        button={(!props.disabled) as true} 
        onClick={(e)=>handleClick(item, i)} 
        key={i}>
        <ListItemText
          primary={item.name}
        />
        {(props.showDelete || props.showRegenerate || props.showAdd) && (!props.onlyShowSelectedIcons || selectedIndex === i) &&
          <ListItemSecondaryAction>
            {props.showDelete &&
              <IconButton disabled={props.disabled} onClick={()=>props.onDeleteClick!(i)} edge="end" aria-label="delete">
                <DeleteIcon />
              </IconButton>
            }
            {props.showAdd &&
              <IconButton disabled={props.disabled} onClick={()=>props.onAddClick!(i)} edge="end" aria-label="add">
                <AddIcon />
              </IconButton>
            }  
            {props.showRegenerate &&
              <IconButton disabled={props.disabled} onClick={()=>props.onRegenerateClick!(i)} edge="end" aria-label="refresh">
                <RefreshIcon />
              </IconButton>
            }
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