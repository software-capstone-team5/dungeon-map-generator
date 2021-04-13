import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import DeleteIcon from '@material-ui/icons/Delete';
import { useRef } from 'react';
import { Probabilities } from '../../generator/Probabilities';


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
  list: Probabilities<T> | null;
  disableListItem?: boolean;
  disableProbs?: boolean;
  showProbs?: boolean;
  showDelete?: boolean;
  onDeleteClick?: (index: number) => void;
  onClick?: (item: T) => void;
  onProbUpdate: (newList: Probabilities<T> | null) => void;
}

ProbabilityNameList.defaultProps = {
  disableListItem: false,
  disableProbs: false,
  showProbs: false,
  showDelete: false
}

function ProbabilityNameList<T extends hasName> (props: Props<T>) {

    const classes = useStyles();
    const invalid = useRef<number | null>(null);
    var pureProbs = props.list ? props.list.toMap() : new Map<T, number>();

    const handleProbabilityChange = (item: T, index: number, newValue: number) => {
      if (newValue < 0 || newValue > 100) {
        return;
      }
      if (Number.isNaN(newValue)) {
        newValue = 0;
        invalid.current = index;
      } else {
        newValue = newValue/100;
        invalid.current = null;
      }
      pureProbs.set(item, parseFloat(newValue.toFixed(4)));
      var newList = new Probabilities<T>(pureProbs, false);

      props.onProbUpdate(newList);
    }

    const handleClick = (item: T) => {
      if (props.onClick && !props.disableListItem) {
        props.onClick(item)
      }
    }

    const handleBlur = (i: number) => {
      if (i === invalid.current && props.list) {
        pureProbs.set(props.list.objects[i], 0);
        var newList = new Probabilities<T>(pureProbs, false);
        invalid.current = null;
        props.onProbUpdate!(newList);
      }
  }

    const listItems = props.list ? props.list.objects.map((item: T, i: number) =>
        <ListItem disabled={props.disableListItem} button={(!props.disableListItem) as true} onClick={(e)=>handleClick(item)} key={i}>
          <ListItemText
            primary={item.name}
          />
          {props.showProbs &&
            <TextField
              type="number"
              onBlur={()=>handleBlur(i)}
              disabled={props.disableProbs}
              value={invalid.current === i ? "" : +(pureProbs.get(item)!*100).toFixed(2)}
              onClick={(event) => event.stopPropagation()}
              onFocus={(event) => event.stopPropagation()}
              onChange={(e)=>handleProbabilityChange(item, i, parseFloat(e.target.value))}
              label="%"
              variant="outlined"
              InputProps={{ inputProps: { min: "0", max: "100", step: "1" } }}
            />
          }
          {props.showDelete &&
            <ListItemSecondaryAction>
              <IconButton disabled={props.disableListItem} onClick={()=>props.onDeleteClick!(i)} edge="end" aria-label="delete">
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          }
        </ListItem>
      )
      :
      <></>;

    

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