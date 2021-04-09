import { memo, useState } from 'react';
import {makeStyles} from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import AddBoxIcon from '@material-ui/icons/AddBox';
import { Probabilities } from '../generator/Probabilities';
import { Configuration } from '../models/Configuration';
import { CorridorCategory } from '../models/CorridorCategory';
import { RegionCategory } from '../models/RegionCategory';
import { RoomCategory } from '../models/RoomCategory';
import { nameOf, valueOf } from '../utils/util';

import ProbabilityNameList from "./common/ProbabilityNameList"
import CorridorCategoryEditor from './CorridorCategoryEditor';
import RoomCategoryEditor from './RoomCategoryEditor';
import SelectCorridorCategory from './SelectCorridorCategory';
import SelectRoomCategory from './SelectRoomCategory';

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

const RegionLevelConfiguration = memo(
    (props: Props) => {
        const classes = useStyles();
        const [addRoomDialogOpen, setAddRoomDialogOpen] = useState(false);
        const [addCorridorDialogOpen, setAddCorridorDialogOpen] = useState(false);
        const [roomEditorOpen, setRoomEditorOpen] = useState(false);
        const [roomCategoryToEdit, setRoomCategoryToEdit] = useState<RoomCategory>();
        const [corridorEditorOpen, setCorridorEditorOpen] = useState(false);
        const [corridorCategoryToEdit, setCorridorCategoryToEdit] = useState<CorridorCategory>();

        const handleDeleteClick = (name: keyof Configuration, index: number) => {
            var updatedList = Object.create(props.configuration[name] as Probabilities<any>);
            updatedList = Object.assign(updatedList, props.configuration[name]);
            updatedList.remove(index);
            props.onChange(name, updatedList);
        }

        const handleAddRoomClick = () => {
           setAddRoomDialogOpen(true);
        }

        const handleAddCorridorClick = () => {
            setAddCorridorDialogOpen(true);
         }

        const handleSelect = (name: keyof Configuration, rc: RegionCategory) => {
            var updatedList = Object.create(props.configuration[name] as Probabilities<any>);
            updatedList = Object.assign(updatedList, props.configuration[name]);
            updatedList.add(rc);
            props.onChange(name, updatedList);
            setAddRoomDialogOpen(false);
            setAddCorridorDialogOpen(false);
        }

        const handleRoomClick = (rc: RoomCategory) => {
            setRoomCategoryToEdit(rc);
            setRoomEditorOpen(true);
        }

        const handleCorridorClick = (cc: CorridorCategory) => {
            setCorridorCategoryToEdit(cc);
            setCorridorEditorOpen(true);
        }

        const handleSave = (name: keyof Configuration, rc: RegionCategory) => {
            var updatedList = Object.create(props.configuration[name] as Probabilities<any>);
            updatedList = Object.assign(updatedList, props.configuration[name]) as Probabilities<any>;
            if (roomCategoryToEdit !== undefined) {
                updatedList.updateObject(roomCategoryToEdit, rc);
            } else if (corridorCategoryToEdit !== undefined) {
                updatedList.updateObject(corridorCategoryToEdit, rc);
            }
            props.onChange(name, updatedList);
            setRoomEditorOpen(false);
            setCorridorEditorOpen(false);
            setRoomCategoryToEdit(undefined);
            setCorridorCategoryToEdit(undefined);
        }

        return (
            <div style={{width: '100%'}}>
                <div className={classes.listLabel}>
                    <Typography >Rooms</Typography>
                    <IconButton onClick={handleAddRoomClick} aria-label="add" color="primary">
                        <AddBoxIcon/>
                    </IconButton>
                </div>

                <ProbabilityNameList
                    showProbs
                    showDelete
                    list={props.configuration.roomCategories}
                    onClick={handleRoomClick}
                    onDeleteClick={(index) => handleDeleteClick(nameOf<Configuration>("roomCategories"), index)}
                    onProbUpdate={(newList) => props.onChange(nameOf<Configuration>("roomCategories"), newList)}
                />
                <div className={classes.listLabel}>
                    <Typography>Corridors</Typography>
                    <IconButton onClick={handleAddCorridorClick} aria-label="add" color="primary">
                        <AddBoxIcon />
                    </IconButton>
                </div>
                <ProbabilityNameList
                    showProbs
                    showDelete
                    list={props.configuration.corridorCategories}
                    onClick={handleCorridorClick}
                    onDeleteClick={(index) => handleDeleteClick(nameOf<Configuration>("corridorCategories"), index)}
                    onProbUpdate={(newList) => props.onChange(nameOf<Configuration>("corridorCategories"), newList)}
                />
                {addRoomDialogOpen &&
                    <SelectRoomCategory
                        open={addRoomDialogOpen}
                        exclude={props.configuration.roomCategories.objects}
                        onSelect={(rc) => handleSelect(nameOf<Configuration>("roomCategories"), rc)}
                        onCancelClick={() => setAddRoomDialogOpen(false)}
                    />
                }
                {addCorridorDialogOpen &&
                    <SelectCorridorCategory
                        open={addCorridorDialogOpen}
                        exclude={props.configuration.corridorCategories.objects}
                        onSelect={(cc) => handleSelect(nameOf<Configuration>("corridorCategories"), cc)}
                        onCancelClick={()=>setAddCorridorDialogOpen(false)}
                    />
                }
                {roomEditorOpen &&
                    <RoomCategoryEditor
                        viewOnly
                        open={roomEditorOpen}
                        roomCategory={roomCategoryToEdit}
                        onSave={(rc: RoomCategory) => handleSave(nameOf<Configuration>("roomCategories"), rc)}
                        onCancelClick={()=>setRoomEditorOpen(false)}
                    />
                }
                {corridorEditorOpen &&
                    <CorridorCategoryEditor
                        viewOnly
                        open={corridorEditorOpen}
                        corridorCategory={corridorCategoryToEdit}
                        onSave={(rc: CorridorCategory) => handleSave(nameOf<Configuration>("corridorCategories"), rc)}
                        onCancelClick={()=>setCorridorEditorOpen(false)}
                    />
                }
            </div>
        );
    },
    (prevProps, nextProps) =>
        prevProps.configuration.roomCategories === nextProps.configuration.roomCategories &&
        prevProps.configuration.corridorCategories === nextProps.configuration.corridorCategories
)


export default RegionLevelConfiguration;