import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import DeleteIcon from '@material-ui/icons/Delete';
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
  disabled?: boolean;
  showProbs?: boolean;
  showDelete?: boolean;
  onDeleteClick?: (index: number) => void;
  onClick?: (item: T) => void;
  onProbUpdate: (newList: Probabilities<T> | null) => void;
}

ProbabilityNameList.defaultProps = {
  disabled: false,
  showProbs: false,
  showDelete: false
}

function ProbabilityNameList<T extends hasName> (props: Props<T>) {

    const classes = useStyles();
    var pureProbs = props.list ? props.list.toMap() : new Map<T, number>();

    const handleProbabilityChange = (item: T, newValue: number) => {
      if (newValue < 0 || newValue > 100 || Number.isNaN(newValue)) {
        return;
      }
      newValue = newValue/100;
      pureProbs.set(item, parseFloat(newValue.toFixed(4)));
      var newList = new Probabilities<T>(pureProbs, false);

      props.onProbUpdate(newList);
    }

    const handleClick = (item: T) => {
      if (props.onClick && !props.disabled) {
        props.onClick(item)
      }
    }

    const listItems = props.list ? props.list.objects.map((item: T, i: number) =>
        <ListItem disabled={props.disabled} button={(!props.disabled) as true} onClick={(e)=>handleClick(item)} key={i}>
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