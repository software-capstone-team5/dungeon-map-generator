import './App.css';
import { useState } from 'react';
import { Grid, AppBar, Toolbar, Typography, Button, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';

import ConfigurationEditor from "./components/ConfigurationEditor";

import { Authenticator } from './Authenticator';

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  topContainer: {
    display: "flex",
    "flex-flow": "column",
    height: "100%",
  },
  content: {
    flex: "2",
    overflow: "auto",
    padding: theme.spacing(3),
  }
}));

function App() {
  const classes = useStyles();
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLoginClick = async () => {
    var result = await Authenticator.loginUser();
    if (result) {
      if (result.valid) {
        setLoggedIn(true);
      } else {
        window.alert(result.response)
      }
    }
  }

  const handleLogoutClick = async () => {
    var success = await Authenticator.logoutUser();
    if (success) {
      setLoggedIn(false);
    }
  }

  const handleRegisterClick = async () => {
    var result = await Authenticator.registerUser();
    if (result) {
      if (result.valid) {
        setLoggedIn(true);
      } else {
        window.alert(result.response)
      }
    }
  }

  return (
    <div className="App">
      <Grid container direction="column" className={classes.topContainer}>
        <div>
          <AppBar position="static">
            <Toolbar>
              <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" className={classes.title}>
                Dungeon Map Generator
              </Typography>
              {loggedIn ?
                <Button onClick={handleLogoutClick} color="inherit">Logout</Button>
                :
                <div>
                  <Button onClick={handleRegisterClick} color="inherit">Register</Button>
                  <Button onClick={handleLoginClick} color="inherit">Login</Button>
                </div>
              }

            </Toolbar>
          </AppBar>
        </div>
        <Grid
          container
          direction="row"
          justify="space-evenly"
          alignItems="center"
          className={classes.content}
        >
          <ConfigurationEditor/>
 
          <p></p>
          <p></p>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
