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
  list: Probabilities<T>;
  showProbs?: boolean;
  showDelete?: boolean;
  onDeleteClick?: (index: number) => void;
  onClick?: (item: T) => void;
  onProbUpdate?: (index: number, newValue: number) => void;
}

ProbabilityNameList.defaultProps = {
  showProbs: false,
  showDelete: false
}

function ProbabilityNameList<T extends hasName> (props: Props<T>) {

    const classes = useStyles();

    const handleProbabilityChange = (index: number, newValue: number) => {
      if (newValue < 0 || newValue > 100) {
        return;
      }
      // TODO: How do we handle non-normalized inputs?
      props.onProbUpdate!(index, newValue/100)
    }

    const listItems = props.list.objects.map((item: T, i: number) =>
      <ListItem button onClick={(e)=>props.onClick!(item)} key={i}>
        <ListItemText
          primary={item.name}
        />
        {props.showProbs &&
          <TextField
            type="number"
            value={props.list.probSum[i]*100}
            onClick={(event) => event.stopPropagation()}
            onFocus={(event) => event.stopPropagation()}
            onChange={(e)=>handleProbabilityChange(i, parseFloat(e.target.value))}
            label="%"
            variant="outlined"
            InputProps={{ inputProps: { min: "0", max: "100", step: "1" } }}
          />
        }
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

export default ProbabilityNameList;