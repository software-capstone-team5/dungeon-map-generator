import './App.css';
import { Grid } from '@material-ui/core';
import Configuration from "./Configuration";

function App() {
  return (
     <div className="App">
      <Grid
        container
        direction="row"
        justify="space-evenly"
        alignItems="center"
        style={{ minHeight: '100vh' }}
      > 
        <Configuration/>
        
        <p></p>
        <p></p>
      </Grid>
    </div>
  );
}

export default App;
