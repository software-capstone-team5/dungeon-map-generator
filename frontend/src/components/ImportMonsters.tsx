import { useState } from 'react';
import readXlsxFile from 'read-excel-file';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';

import { Monster } from '../models/Monster';


type Props = {
  open: boolean;
  onCancelClick: () => void;
}

export default function ImportMonsters(props: Props) {

    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [monsters, setMonsters] = useState<Monster[]>([]);

    const handleFileUpload = (event: any) => {
        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xlsx)$/;
        console.log(event.target.value)
        if (!regex.test(event.target.value)) {
            setErrorMessage("File type is invalid.")
            setError(true);
            return;
        }
        var file = event.target.files[0];
        var monstersList = new Array();
        readXlsxFile(file).then((rows: any[]) => {
            var errorFound = false;
            rows.forEach((row) => {
                if (errorFound) {
                    return;
                }
                if (row.length !== 3) {
                    errorFound = true;
                    setErrorMessage("Length of row is not 3.")
                    return;
                }
                var monster = new Monster();
                monster.name = row[0].toString();
                monster.description = row[1].toString();
                if (!Number.isInteger(row[2]) || row[2] < Monster.minChallenge || row[2] > Monster.maxChallenge) {
                    errorFound = true;
                    setErrorMessage("Third column is not an integer, or it is not between " + Monster.minChallenge + " and " +  Monster.maxChallenge + ".")
                    return;
                }
                monster.challenge = row[2];
                monstersList.push(monster);
            })
            
            setError(errorFound);
            setMonsters(monsters);
        })
    }

    const handleSave = () => {
        // TODO: send 'monsters' to the backend
        props.onCancelClick();
    }

  return (
    <div>
      <Dialog open={props.open} aria-labelledby="form-dialog-title">
        <DialogTitle>
              Import Monsters from Excel
        </DialogTitle>
        <DialogContent>
         <Typography>Monsters need to be in an Excel spreadsheet (.xlsx) in this format</Typography>
         <Typography style={{paddingTop: 20}} color="textSecondary" align="center">NAME | DESCRIPTION | CHALLENGE RATING</Typography>
         <div style={{paddingTop: 20, paddingBottom: 20}}>
            <input type="file" accept=".xlsx" onChange={handleFileUpload} />
         </div>
         <Typography variant="caption" color="error">{error && errorMessage}</Typography>
            
        </DialogContent>

        <DialogActions>
        <Button onClick={props.onCancelClick} color="primary">
        Cancel
        </Button>
        <Button disabled={error} onClick={handleSave} variant="contained" color="primary">
            Import
        </Button>
        
        </DialogActions>
      </Dialog>
    </div>
  );
}