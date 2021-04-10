import { useState } from 'react';
import readXlsxFile from 'read-excel-file';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';

import { Monster } from '../models/Monster';
import { DB } from '../DB';


type Props = {
  open: boolean;
  onCancelClick: () => void;
}

export default function ImportMonsters(props: Props) {

  const [error, setError] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [monsters, setMonsters] = useState<Monster[]>([]);

  const handleFileUpload = (event: any) => {
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xlsx)$/;
    console.log(event.target.value)
    if (!regex.test(event.target.value)) {
      setErrorMessages(["File type is invalid."])
      setError(true);
      return;
    }
    var file = event.target.files[0];
    var monstersList: Monster[] = [];
    readXlsxFile(file).then((rows: any[]) => {
      var errorFound = false;
      var errors: string[] = [];

      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var rowNumber = i + 1;
        if (row.length !== 3) {
          errorFound = true;
          errors.push("Number of columns in the spreadsheet is not 3.")
          break;
        }
        var monster = new Monster();
        monster.name = row[0].toString();
        monster.description = row[1].toString();
        if (!Number.isInteger(row[2])) {
          errorFound = true;
          errors.push("Row #" + rowNumber + ": Third column is not an integer.");
          continue;
        } else if (row[2] < Monster.minChallenge || row[2] > Monster.maxChallenge) {
          errorFound = true;
          errors.push("Row #" + rowNumber + ": Third column is not between " + Monster.minChallenge + " and " + Monster.maxChallenge + ".");
          continue;
        }
        monster.challenge = row[2];
        monstersList.push(monster);
      }

      setErrorMessages(errors);
      setError(errorFound);
      setMonsters(monstersList);
    })
  }

  const handleSave = () => {
    // TODO: send 'monsters' to the backend
    DB.saveMonsters(monsters)
    props.onCancelClick();
  }

  const errorMessageTexts = errorMessages.map((message: string, index: number) =>
    <div key={index}>
      <Typography variant="caption" color="error">{message}</Typography>
    </div>
  )

  return (
    <div>
      <Dialog open={props.open} aria-labelledby="form-dialog-title">
        <DialogTitle>
          Import Monsters from Excel
        </DialogTitle>
        <DialogContent>
          <Typography>Monsters need to be in an Excel spreadsheet (.xlsx) in this format</Typography>
          <Typography style={{ paddingTop: 20 }} color="textSecondary" align="center">NAME | DESCRIPTION | CHALLENGE RATING</Typography>
          <div style={{ paddingTop: 20, paddingBottom: 20 }}>
            <input type="file" accept=".xlsx" onChange={handleFileUpload} />
          </div>
          {error && errorMessageTexts}

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