import { InputLabel, makeStyles, MenuItem, Select, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import TextField from '@material-ui/core/TextField';
import { useState } from "react";
import ImageUploading, { ImageListType, ImageType } from "react-images-uploading";
import { TileType } from "../constants/TileType";
import { TileSet } from '../models/TileSet';


const useStyles = makeStyles((theme) =>  ({
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
}));

type Props = {
  open: boolean;
  onCancelClick: ()=>void;
}

TileSetEditor.defaultProps = {
  viewOnly: false
}

type Errors = {
  name: boolean;
}

export default function TileSetEditor(props: Props) {
  
  const classes = useStyles();
  const [tileSet, setTileSet] = useState(new TileSet("", 48, new Map()));
  const [images, setImages] = useState<ImageListType>([]);
  const [tileTypes, setTileTypes] = useState<(TileType|"")[]>([]);
  const [errors, setErrors] = useState<Errors>({
    name: false
  })

  const maxNumber = Object.keys(TileType).length;

  const handleNameChange = (value: string) => {
    if (value) {
      setErrors({
        ...errors,
        name: false
      })
    }
    setTileSet(Object.assign(Object.create(Object.getPrototypeOf( tileSet)), tileSet, { "name": value }) );
  }

  const handleNameBlur = () => {
    if (!tileSet.name) {
      setErrors({
        ...errors,
        name: true
      })
    }
  }

  const handleSaveClick = () => {
    console.log(images);
    if (!tileSet.name) {
      return;
    } else if (images.length !== maxNumber) {
      return;
    } else if (tileTypes.includes("")) {
      return;
    }

    var imagesCopy = [...images];
    imagesCopy.forEach((image: ImageType, index: number) => {
      // image.file!.name = ""
    });
    
    // TODO: Make call to backend, 'images' contains the images
    // Save a TileSet document in the TileSets collection with name/id ONLY set field
    // Backend should error out if name already exists

    props.onCancelClick();
  }

  const onChange = (
    imageList: ImageListType,
    addUpdateIndex: number[] | undefined
  ) => {
    // data for submit
    var amountToAdd = imageList.length - tileTypes.length;
    var typeCopy = [...tileTypes];
    for (var i=0; i < amountToAdd; i++) {
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
        <DialogTitle
          className={classes.root}
          disableTypography
          id="form-dialog-title">
          <Typography component={'span'} variant="h6">Upload a Tile Set</Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
              required
              error={errors.name}
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
              onChange={(e)=>handleNameChange(e.target.value)}
          />
          <div>
            <ImageUploading
              multiple
              value={images}
              onChange={onChange}
              maxNumber={maxNumber}
            >
              {({
                imageList,
                onImageUpload,
                onImageRemoveAll,
                onImageUpdate,
                onImageRemove,
                isDragging,
                dragProps
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
                          onChange={(e, c)=>handleTypeChange(index, e.target.value as TileType)}
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
          <Button onClick={handleSaveClick} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}