import './App.css';
import { Grid } from '@material-ui/core';
import ConfigurationEditor from "./ConfigurationEditor";

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
        <ConfigurationEditor/>
        
        <p></p>
        <p></p>
      </Grid>
    </div>
  );
}

export default App;
