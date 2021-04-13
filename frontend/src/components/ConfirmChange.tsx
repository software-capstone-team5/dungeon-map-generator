import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

type Props = {
	open: boolean;
	message: string;
  	onDecision: (confirm: boolean) => void;
}

function ConfirmChange(props: Props) {
	return (
		<div>
			<Dialog
				open={props.open}
				aria-labelledby="form-dialog-title">
				<DialogTitle id="form-dialog-title">Select Item</DialogTitle>
				<DialogContent>
					{props.message}
					<Button onClick={() => props.onDecision(true)} variant="outlined" style={{ width: "100%" }} color="primary">
						Add New
					</Button>
				</DialogContent>
				<DialogActions>
				<Button onClick={() => props.onDecision(false)} color="primary">
					Cancel
				</Button>
				</DialogActions>
			</Dialog>
		</div>
  );
}

export default ConfirmChange;