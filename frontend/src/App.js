import './App.css';
import { Grid, AppBar, Toolbar, Typography, Button, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';

import ConfigurationEditor from "./ConfigurationEditor";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

function App() {
  const classes = useStyles();
  return (
    <div className="App">
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Dungeon Map Generator
            </Typography>
            <Button color="inherit">Login</Button> {/* TODO: Change this button depending on login state */}
          </Toolbar>
        </AppBar>
      </div>
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
