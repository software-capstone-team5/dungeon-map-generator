import { AppBar, Button, Grid, Toolbar, Typography } from '@material-ui/core';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
import ListIcon from '@material-ui/icons/List';
import MenuIcon from '@material-ui/icons/Menu';
import { useEffect, useState } from 'react';
import './App.css';
import { Authenticator } from './Authenticator';
import ConfigurationEditor from "./components/ConfigurationEditor";
import DungeonDisplay from './components/DungeonDisplay';
import ImportMonsters from './components/ImportMonsters';
import SelectConfiguration from "./components/SelectConfiguration";
import TileSetEditor from './components/TileSetEditor';
import { TileType } from './constants/TileType';
import DB from './DB';
import { DungeonGenerator } from './generator/DungeonGenerator';
import { Probabilities } from './generator/Probabilities';
import { TileSet } from './models/TileSet';

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
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  spaced: {
    margin: "5px"
  }
}));

function App() {
  const classes = useStyles();
  const [loggedIn, setLoggedIn] = useState(null);
  const [selectConfigDialogOpen, setSelectConfigDialogOpen] = useState(false);
  const [configToEdit, setConfigToEdit] = useState();
  const [dungeonMap, setDungeonMap] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Authenticator.init();
    Authenticator.onAuthListener((result) => {
      setLoggedIn(result);
    })
  }, [])

  const handleLoginClick = async () => {
    setIsLoading(true);
    var result = await Authenticator.loginUser();
    if (result) {
      if (result.valid) {
        window.location.reload();
        setLoggedIn(true);
      } else {
        window.alert(result.response)
      }
    }
    setIsLoading(false)
  }

  const handleLogoutClick = async () => {
    setIsLoading(true);
    var success = await Authenticator.logoutUser();
    if (success) {
      setLoggedIn(false);
      window.location.reload();
    }
    setIsLoading(false)
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

  const handleConfigSelect = (configID, premade) => {
    if (!configID) {
      return;
    }
    setIsLoading(true);
    setSelectConfigDialogOpen(false);
    DB.getConfigByID(configID, premade).then(result => {
      setIsLoading(false)
      if (result && result.valid) {
        setConfigToEdit(result.response);
      }
    }).catch(() => setIsLoading(false))
  }

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [importMonstersOpen, setImportMonstersOpen] = useState(false);
  const [uploadTileSetOpen, setUploadTileSetOpen] = useState(false);

  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setMenuAnchorEl(null);
  };

  const importMonstersClick = () => {
    setImportMonstersOpen(true);
    handleClose();
  }

  const uploadTilesetClick = () => {
    setUploadTileSetOpen(true);
    handleClose();
  }

  const handleGenerateClick = (config) => {
    if (config) {
      // TODO: remove this when tilesets work
      var defaultSet = TileSet.getDefault();
      for (var tileType of Object.values(TileType)) {
        var img = new Image();
        img.src = process.env.PUBLIC_URL + "/TileSets/Default/" + tileType + ".png";
        defaultSet.addTileToSet(tileType, img);
      }
      var tileSets = Probabilities.buildUniform([defaultSet]);
      config.defaultRoomCategory.tileSets = tileSets;
      config.defaultCorridorCategory.tileSets = tileSets;
      var dungeonMap = DungeonGenerator.generateDungeon(config);
      // updateAndRetrieveTileSets(dungeonMap);
      setDungeonMap(dungeonMap);
    }
  }

  const handleConfigSaveSuccess = (config) => {
    setConfigToEdit(config);
  }

  const findTileSets = () => {
    // TODO: Call the backend for this
  }

  const updateAndRetrieveTileSets = (dungeonMap) => {
    var defaultSet = TileSet.getDefault();
    for (var tileType of Object.values(TileType)) {
      var img = new Image();
      img.src = process.env.PUBLIC_URL + "/TileSets/Default/" + tileType + ".png";
      defaultSet.addTileToSet(tileType, img);
    }

    // var tileSets = Probabilities.buildUniform([defaultSet]);
    //   config.defaultRoomCategory.tileSets = tileSets;
    //   config.defaultCorridorCategory.tileSets = tileSets;

    // Tileset name to rooms/corridors that use it
    var tileSetsToFetch = new Map();
    var regions = dungeonMap.corridors.concat(dungeonMap.rooms);
    regions.forEach(region => {
      console.log(region)
      if (region.tileSet.isDefault()) {
        region.tileSet = defaultSet;
        return;
      }

      if (tileSetsToFetch.has(region.tileSet.name)) {
        tileSetsToFetch.get(region.tileSet.name).push(region)
      } else {
        tileSetsToFetch.set(region.tileSet.name, [region])
      } 
    });

    // TODO: Use tileSetsToFetch to fetch the images

    // TODO: Create the proper TileSet object

    // TODO: store tileSetsToFetch and the images so that if the set doesn't change
    // we can use the same images

    tileSetsToFetch.forEach((tileSetName, regionList) => {
      regionList.forEach((region) => {
        // region.tileSet = 
      })
    })

  }

  return (
    <div className="App">
      <Menu
        id="simple-menu"
        anchorEl={menuAnchorEl}
        keepMounted
        open={Boolean(menuAnchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={importMonstersClick}>Import Monsters</MenuItem>
        <MenuItem onClick={uploadTilesetClick}>Upload TileSet</MenuItem>
        <MenuItem onClick={findTileSets}>Find TileSets in Drive</MenuItem>
      </Menu>
      {importMonstersOpen &&
        <ImportMonsters open={importMonstersOpen} onCancelClick={() => setImportMonstersOpen(false)}></ImportMonsters>
      }
      {uploadTileSetOpen &&
        <TileSetEditor open={uploadTileSetOpen} onCancelClick={() => setUploadTileSetOpen(false)}></TileSetEditor>
      }
      <Backdrop className={classes.backdrop} open={loggedIn === null || isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {loggedIn !== null &&
        <Grid container direction="column" className={classes.topContainer}>
          <div>
            <AppBar position="static">
              <Toolbar>
                {loggedIn &&
                  <IconButton edge="start" onClick={handleMenuClick} className={classes.menuButton} color="inherit" aria-label="menu">
                    <MenuIcon />
                  </IconButton>
                }
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
            alignItems="center"
            className={classes.content}
          >
            <div className={classes.spaced}>
              <Typography variant="h5" gutterBottom>Configuration</Typography>
              <div>
                <IconButton onClick={handleLoadConfigClick} color="primary">
                  <ListIcon />
                </IconButton>
                <Button onClick={handleNewConfigClick} color="primary" variant="outlined">New</Button>
              </div>
              <ConfigurationEditor
                configuration={configToEdit}
                onSaveSuccess={handleConfigSaveSuccess}
                onGenerateClick={handleGenerateClick}
              />
              {selectConfigDialogOpen &&
                <SelectConfiguration
                  open={selectConfigDialogOpen}
                  onSelect={handleConfigSelect}
                  onCancelClick={() => setSelectConfigDialogOpen(false)}
                />
              }
            </div>
            <DungeonDisplay map={dungeonMap} canvasProps={null}></DungeonDisplay>
          </Grid>
        </Grid>
      }
    </div>
  );
}

export default App;
