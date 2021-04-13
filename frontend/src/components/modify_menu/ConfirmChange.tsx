import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

const useStyles = makeStyles((theme) => ({
	root: {
	  margin: 0,
	  padding: theme.spacing(2),
	},
  }));

type Props = {
	open: boolean;
	message: string;
	args: any;
  	onDecision?: (confirm: boolean, args: any) => void;
}

function ConfirmChange(props: Props) {
	const classes = useStyles();

	return (
		<div>
			<Dialog
          		className={classes.root}
				open={props.open}
				aria-labelledby="form-dialog-title">
				<DialogTitle id="form-dialog-title">Confirm Change</DialogTitle>
				<DialogContent>
					{props.message}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => props.onDecision ? props.onDecision(false, props.args) : {}} color="primary">
						Cancel
					</Button>
					<Button onClick={() => props.onDecision ? props.onDecision(true, props.args) : {}} variant="outlined" color="primary">
						Confirm
					</Button>
				</DialogActions>
			</Dialog>
		</div>
  );
}

export default ConfirmChange;