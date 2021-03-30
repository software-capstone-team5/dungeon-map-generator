import { IconButton, makeStyles, Typography } from '@material-ui/core';
import AddBoxIcon from '@material-ui/icons/AddBox';
import { useState } from 'react';
import { Probabilities } from '../generator/Probabilities';
import { Configuration } from '../models/Configuration';
import { nameOf, valueOf } from '../utils/util';

import RegionCategoryEditor from './RegionCategoryEditor';
import RegionCategoryList from './RegionCategoryList';

const useStyles = makeStyles({
    listLabel: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
});

type Props = {
    configuration: Configuration;
    onChange: (name: keyof Configuration, value: valueOf<Configuration>)=>void;
}

function RegionLevelConfiguration(props: Props) {
    const classes = useStyles();
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    
    const handleDeleteClick = (name: keyof Configuration, index: number) => {
        var updatedList = (props.configuration[name]) as Probabilities<any>;
        updatedList.remove(index);
        props.onChange(name, updatedList);
    }

    const handleProbUpdate = (name: keyof Configuration, index: number, newValue: number) => {
        var updatedList = (props.configuration[name]) as Probabilities<any>;
        updatedList.probSum[index] = newValue;
        // TODO: normalize?
        props.onChange(name, updatedList);
    }

    const handleAddClick = () => {
       setAddDialogOpen(true);
    }

    return (
        <div style={{width: '100%'}}>
            <div className={classes.listLabel}>
                <Typography >Rooms</Typography>
                <IconButton aria-label="delete"color="primary">
                    <AddBoxIcon onClick={handleAddClick} />
                </IconButton>
            </div>
            
            <RegionCategoryList 
                list={props.configuration.roomCategories} 
                onDeleteClick={handleDeleteClick}
                onProbUpdate={handleProbUpdate}
                callbackPropertyName={nameOf<Configuration>("roomCategories")}
            />
            <div className={classes.listLabel}>
                <Typography>Corridors</Typography>
                <IconButton aria-label="delete"color="primary">
                    <AddBoxIcon onClick={handleAddClick} />
                </IconButton>
            </div>
            <RegionCategoryList
                list={props.configuration.corridorCategories}
                onDeleteClick={handleDeleteClick}
                onProbUpdate={handleProbUpdate}
                callbackPropertyName={nameOf<Configuration>("corridorCategories")}
            />
            <RegionCategoryEditor open={addDialogOpen}/>
        </div>
    );
}

export default RegionLevelConfiguration;