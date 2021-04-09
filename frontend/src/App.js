import './App.css';
import { useState, useEffect } from 'react';
import { Grid, AppBar, Toolbar, Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import IconButton from '@material-ui/core/IconButton';
import ListIcon from '@material-ui/icons/List';

import ConfigurationEditor from "./components/ConfigurationEditor";
import SelectConfiguration from "./components/SelectConfiguration";

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
  const [loggedIn, setLoggedIn] = useState(null);
  const [selectConfigDialogOpen, setSelectConfigDialogOpen] = useState(false);
  const [configToEdit, setConfigToEdit] = useState();

  useEffect(() => {
    Authenticator.onAuthListener((result) => {
      setLoggedIn(result);
    })
  }, [])

  const handleLoginClick = async () => {
    var result = await Authenticator.loginUser();
    if (result) {
      if (result.valid) {
        window.location.reload();
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
      window.location.reload();
    }
  }

  const handleRegisterClick = async () => {
    var result = await Authenticator.registerUser();
    if (result) {
      if (result.valid) {
        window.location.reload();
        setLoggedIn(true);
      } else {
        window.alert(result.response)
      }
    }
  }

  const handleLoadConfigClick = () => {
    setSelectConfigDialogOpen(true);
  }

  const handleNewConfigClick = () => {
    setConfigToEdit();
  }

  const handleConfigSelect = (config) => {
    // Pass it to the editor?
    setConfigToEdit(config);
    setSelectConfigDialogOpen(false);
  }

  return (
    <div className="App">
      {loggedIn !== null && // TODO: do something more elegant, like a loading bar
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
              <div>
                <Typography variant="h5" gutterBottom>Configuration</Typography>
                <div>
                  <IconButton onClick={handleLoadConfigClick} color="primary">
                    <ListIcon />
                  </IconButton>
                  <Button onClick={handleNewConfigClick} color="primary" variant="outlined">New</Button>
                </div>
                <ConfigurationEditor configuration={configToEdit}/>
                {selectConfigDialogOpen &&
                  <SelectConfiguration
                      open={selectConfigDialogOpen}
                      onSelect={handleConfigSelect}
                      onCancelClick={() => setSelectConfigDialogOpen(false)}
                  />
                }
              </div>
              

              <p></p>
              <p></p>
            </Grid>
          </Grid>
      }
    </div>
  );
}

export default App;
