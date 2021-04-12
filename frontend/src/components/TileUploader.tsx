import { Button, InputLabel, MenuItem, Select } from "@material-ui/core";
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from "react";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { TileType } from "../constants/TileType";


const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
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
  }),
);


export default function TileUploader() {
  const classes = useStyles();
  const [images, setImages] = React.useState([]);
  const [tileTypes, setTileTypes] = React.useState<(TileType|"")[]>([]);
  const maxNumber = Object.keys(TileType).length;

  console.log(tileTypes);
  console.log(images);

  const onChange = (
    imageList: ImageListType,
    addUpdateIndex: number[] | undefined
  ) => {
    // data for submit
    console.log(imageList, addUpdateIndex);
    var amountToAdd = imageList.length - tileTypes.length;
    var typeCopy = [...tileTypes];
    for (var i=0; i < amountToAdd; i++) {
      typeCopy.push("");
    }
    if (amountToAdd > 0) {
      setTileTypes(typeCopy)
    }
    setImages(imageList as never[]);
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

  const handleSaveFirstImage = () => {
    console.log(images[0])
  }

  return (
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
              {...dragProps}
            >
              Click to upload
            </Button>
            &nbsp;
            <Button onClick={() => handleImageRemoveAll(onImageRemoveAll)}>Remove all images</Button>
            <Button onClick={handleSaveFirstImage}>SAVE FIrst</Button>
            <div className={classes.root}>
              <GridList cols={4} className={classes.gridList}>
              {imageList.map((image, index) => (
                <GridListTile>
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
  );
}
