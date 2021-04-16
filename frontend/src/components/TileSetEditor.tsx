// REQ-8: Upload.Tiles - The system shall allow a logged in user to upload tiles to be saved in their Google Drive in correct DMG format.


import { InputLabel, makeStyles, MenuItem, Select, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { useState } from "react";
import ImageUploading, { ImageListType, ImageType } from "react-images-uploading";
import { TileType } from "../constants/TileType";
import { DB } from '../DB';
import { TileSet } from '../models/TileSet';


const useStyles = makeStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  aboveGridList: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    width: 500,
    height: 450,
  },
  icon: {
    color: 'rgba(255, 255, 255, 0.54)',
  },
  helpIcon: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  customWidth: {
    maxWidth: 200,
  },
  verticalPadding: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  }
}));

type Props = {
  open: boolean;
  onCancelClick: () => void;
}

TileSetEditor.defaultProps = {
  viewOnly: false
}

type Errors = {
  name: boolean;
  notFullSet: boolean;
  emptyType: boolean;
}

export default function TileSetEditor(props: Props) {

  const classes = useStyles();
  const [tileSet, setTileSet] = useState(new TileSet("", 48, new Map()));
  const [images, setImages] = useState<ImageListType>([]);
  const [tileTypes, setTileTypes] = useState<(TileType | "")[]>([]);
  const [myErrors, setMyErrors] = useState<Errors>({
    name: false,
    notFullSet: false,
    emptyType: false,
  })
  const [isPending, setIsPending] = useState(false);

  const maxNumber = Object.keys(TileType).length;

  const handleNameChange = (value: string) => {
    if (value && value.toLowerCase() !== "Default".toLowerCase()) {
      setMyErrors({
        ...myErrors,
        name: false
      })
    }
    setTileSet(Object.assign(Object.create(Object.getPrototypeOf(tileSet)), tileSet, { "name": value }));
  }

  const handleNameBlur = () => {
    if (!tileSet.name || tileSet.name.toLowerCase() === "Default".toLowerCase()) {
      setMyErrors({
        ...myErrors,
        name: true
      })
    }
  }

  const handleSaveBlur = () => {
    setMyErrors({
      ...myErrors,
      notFullSet: false,
      emptyType: false
    })
  }

  const handleSaveClick = async () => {
    console.log(images);
    if (!tileSet.name) {
      return;
    } else if (tileSet.name.toLowerCase() === "Default".toLowerCase()) {
      return;
    } else if (images.length !== maxNumber) {
      setMyErrors({
        ...myErrors,
        notFullSet: true
      })
      return;
    } else if (tileTypes.includes("")) {
      setMyErrors({
        ...myErrors,
        emptyType: true
      })
      return;
    }

    var imagesCopy = [...images];
    var fileArray: File[] = []
    imagesCopy.forEach((image: ImageType, index: number) => {
      if (image.file !== undefined) {
        fileArray.push(image.file)
      }
    });

    // Save a TileSet document in the TileSets collection with name/id ONLY set field
    // Backend should error out if name already exists
    setIsPending(true)
    var result = await DB.saveTileSets(tileSet.name, fileArray, tileTypes as TileType[])
    if (result && result.valid) {
      // var id = result.response;
      setIsPending(false)
      window.alert("Tileset upload success"); // TBD do we need to use the Tileset DB ID 
    } else {
      if (result) {
        setIsPending(false)
        window.alert(result.response);
      }
    }

    props.onCancelClick();
  }

  const onChange = (
    imageList: ImageListType,
    addUpdateIndex: number[] | undefined
  ) => {
    // data for submit
    var amountToAdd = imageList.length - tileTypes.length;
    var typeCopy = [...tileTypes];
    for (var i = 0; i < amountToAdd; i++) {
      typeCopy.push("");
    }
    if (amountToAdd > 0) {
      setTileTypes(typeCopy)
    }
    setImages(imageList);
  };

  const handleImageRemove = (func: (index: number) => void, index: number) => {
    // Free up tile type
    var typeCopy = [...tileTypes];
    typeCopy.splice(index, 1);
    setTileTypes(typeCopy);
    func(index);
  }

  const handleImageRemoveAll = (func: () => void) => {
    setTileTypes([]);
    func();
  }

  const handleTypeChange = (index: number, type: TileType | "") => {
    var typeCopy = [...tileTypes];
    typeCopy[index] = type;
    setTileTypes(typeCopy);
  }

  return (
    <div>
      <Dialog open={props.open} aria-labelledby="form-dialog-title">
        {isPending &&
          <div style={{ textAlign: "center" }}>
            <CircularProgress />
          </div>
        }
        <DialogTitle
          className={classes.root}
          disableTypography
          id="form-dialog-title">
          <Grid container alignItems="center">
            <Typography component={'span'} variant="h6">Upload a Tile Set</Typography>
            <Tooltip
              arrow
              classes={{ tooltip: classes.customWidth }}
              title={
                <>
                  <Typography align="center" color="inherit"><u>Help</u></Typography>
                  <Typography variant="body2" color="inherit">Accepted File Types: .png/jpg</Typography>
                  <Typography variant="body2" color="inherit">Max File Size: 5MB</Typography>
                  <Typography variant="body2" color="inherit">Required Resolution: 48px by 48px</Typography>
                  <br></br>
                  <Typography variant="body2" color="inherit">Files will be uploaded to your Google Drive, under the "DMG_Tilesets" folder</Typography>
                </>
              }
            >
              <HelpOutlineIcon className={classes.helpIcon} color="primary"></HelpOutlineIcon>
            </Tooltip>
          </Grid>
        </DialogTitle>
        <DialogContent>
          <TextField
            required
            error={myErrors.name}
            onBlur={handleNameBlur}
            variant="outlined"
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            value={tileSet.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
          <div>
            <ImageUploading
              multiple
              value={images}
              onChange={onChange}
              maxNumber={maxNumber}
              acceptType={['jpg', 'png']}
              resolutionType="absolute"
              resolutionWidth={48}
              resolutionHeight={48}
              maxFileSize={5242880}
            >
              {({
                imageList,
                onImageUpload,
                onImageRemoveAll,
                onImageUpdate,
                onImageRemove,
                isDragging,
                dragProps,
                errors
              }) => (
                // write your building UI
                <div className="upload__image-wrapper">
                  <Button
                    style={isDragging ? { color: "red" } : undefined}
                    onClick={onImageUpload}
                    color="primary"
                    variant="outlined"
                    {...dragProps}
                  >
                    Click to upload
                  </Button>
                  &nbsp;
                  <Button
                    color="secondary"
                    variant="outlined"
                    onClick={() => handleImageRemoveAll(onImageRemoveAll)}
                  >
                    Remove all images
                  </Button>
                  {errors && <div className={classes.verticalPadding}>
                    {errors.maxNumber && <span>Number of selected images exceeds max</span>}
                    {errors.acceptType && <span>Your selected file type is not .jpg or .png</span>}
                    {errors.maxFileSize && <span>Selected file size exceeds 5MB</span>}
                    {errors.resolution && <span>Selected file needs to be 48px by 48px</span>}
                  </div>}
                  {myErrors && <div className={classes.verticalPadding}>
                    {myErrors.notFullSet && <span>Can only save a full set ({maxNumber} images)</span>}
                    {myErrors.emptyType && <span>Must select a type for every image</span>}
                    {myErrors.name && tileSet.name.toLowerCase() === "Default".toLowerCase() && <span>Name of set cannot be "Default"</span>}
                  </div>}
                  <div className={classes.aboveGridList}>
                    <GridList cols={4} className={classes.gridList}>
                      {imageList.map((image, index) => (
                        <GridListTile key={index}>
                          <div key={index}>
                            <img src={image.dataURL} alt="" width="50" height="50" />
                            <InputLabel id="demo-simple-select-label">Tile Type</InputLabel>
                            <Select
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              value={tileTypes[index]}
                              onChange={(e, c) => handleTypeChange(index, e.target.value as TileType)}
                            >
                              <MenuItem value=""></MenuItem>
                              {Object.values(TileType).map((type, i) =>
                                <MenuItem key={index.toString() + "_" + i.toString()} disabled={tileTypes.includes(type)} value={type}>{type}</MenuItem>
                              )}
                            </Select>
                            <div className="image-item__btn-wrapper">
                              <button onClick={() => onImageUpdate(index)}>Update</button>
                              <button onClick={() => handleImageRemove(onImageRemove, index)}>Remove</button>
                            </div>
                          </div>
                        </GridListTile>
                      ))}
                    </GridList>
                  </div>
                </div>
              )}
            </ImageUploading>
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={props.onCancelClick} color="primary">
            Cancel
          </Button>
          <Button onBlur={handleSaveBlur} onClick={handleSaveClick} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}