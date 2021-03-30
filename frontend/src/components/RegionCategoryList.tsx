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
  onProbUpdate: (name: keyof Configuration, index: number, newValue: number) => void;
}

function RegionCategoryList (props: Props) {

    const classes = useStyles();

    const handleProbabilityChange = (index: number, newValue: number) => {
      if (newValue < 0 || newValue > 100) {
        return;
      }
      // TODO: How do we handle non-normalized inputs?
      props.onProbUpdate(props.callbackPropertyName, index, newValue/100)
    }

    const listItems = props.list.objects.map((rc: RegionCategory, i: number) =>
      <ListItem button key={i}>
        <ListItemText
          primary={rc.name}
        />
        <TextField
          type="number"
          value={props.list.probSum[i]*100}
          onChange={(e)=>handleProbabilityChange(i, parseFloat(e.target.value))}
          label="%"
          variant="outlined"
          InputProps={{ inputProps: { min: "0", max: "100", step: "1" } }}
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