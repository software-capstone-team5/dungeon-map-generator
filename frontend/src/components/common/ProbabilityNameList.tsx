import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  IconButton,
  TextField
} from '@material-ui/core';

import { Probabilities } from '../../generator/Probabilities';
import { couldStartTrivia } from 'typescript';


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
    list: {
      overflow: 'auto',
    }
}));

interface hasName {
  name: string;
}

type Props<T extends hasName> = {
  list: Probabilities<T>;
  disabled?: boolean;
  showProbs?: boolean;
  showDelete?: boolean;
  onDeleteClick?: (index: number) => void;
  onClick?: (item: T) => void;
  onProbUpdate?: (newList: Probabilities<T>) => void;
}

ProbabilityNameList.defaultProps = {
  disabled: false,
  showProbs: false,
  showDelete: false
}

function ProbabilityNameList<T extends hasName> (props: Props<T>) {

    const classes = useStyles();
    var pureProbs = props.list.toMap();

    const handleProbabilityChange = (item: T, newValue: number) => {
      if (newValue < 0 || newValue > 100 || Number.isNaN(newValue)) {
        return;
    }
      newValue = newValue/100;
      pureProbs.set(item, parseFloat(newValue.toFixed(4)));
      var newList = new Probabilities<T>(pureProbs, false);

      props.onProbUpdate!(newList);
    }

    const handleClick = (item: T) => {
      if (props.onClick && !props.disabled) {
        props.onClick(item)
      }
    }

    const listItems = props.list.objects.map((item: T, i: number) =>
      <ListItem button={(!props.disabled) as true} onClick={(e)=>handleClick(item)} key={i}>
        <ListItemText
          primary={item.name}
        />
        {props.showProbs &&
          <TextField
            type="number"
            disabled={props.disabled}
            value={+(pureProbs.get(item)!*100).toFixed(2)}
            onClick={(event) => event.stopPropagation()}
            onFocus={(event) => event.stopPropagation()}
            onChange={(e)=>handleProbabilityChange(item, parseFloat(e.target.value))}
            label="%"
            variant="outlined"
            InputProps={{ inputProps: { min: "0", max: "100", step: "1" } }}
          />
        }
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
          <List className={classes.list} dense>
            {listItems}
          </List>
        </div>
      </div>
    );

}

export default ProbabilityNameList;