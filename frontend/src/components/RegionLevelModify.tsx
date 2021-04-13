import { makeStyles } from '@material-ui/core';
import FormLabel from '@material-ui/core/FormLabel';
import IconButton from '@material-ui/core/IconButton';
import AddBoxIcon from '@material-ui/icons/AddBox';
import lodash from 'lodash';
import { memo, useState } from 'react';
import { Probabilities } from '../generator/Probabilities';
import { Configuration } from '../models/Configuration';
import { CorridorCategory } from '../models/CorridorCategory';
import { RegionCategory } from '../models/RegionCategory';
import { RoomCategory } from '../models/RoomCategory';
import { nameOf, valueOf } from '../utils/util';
import NameList from "./common/NameList";
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
    isSaving: boolean;
    configuration: Configuration;
    savePhrase?: string;
    onChange: (name: keyof Configuration, value: valueOf<Configuration>)=>void;
    selectCategory?: (category: RegionCategory) => void;
}

const RegionLevelModify = memo(
    (props: Props) => {
        var disabled = props.isSaving || props.configuration.premade;

        const classes = useStyles();
        const [addRoomDialogOpen, setAddRoomDialogOpen] = useState(false);
        const [addCorridorDialogOpen, setAddCorridorDialogOpen] = useState(false);
        const [roomEditorOpen, setRoomEditorOpen] = useState(false);
        const [roomCategoryToEdit, setRoomCategoryToEdit] = useState<RoomCategory>();
        const [corridorEditorOpen, setCorridorEditorOpen] = useState(false);
        const [corridorCategoryToEdit, setCorridorCategoryToEdit] = useState<CorridorCategory>();
        const [editingDefault, setEditingDefault] = useState(false);
        const [selectingDefault, setSelectingDefault] = useState(false);

        const handleDeleteClick = (name: keyof Configuration, index: number) => {
            var updatedList = Object.create(Object.getPrototypeOf(props.configuration[name]) as Probabilities<any>);
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
            var updatedList = Object.create(Object.getPrototypeOf(props.configuration[name]) as Probabilities<any>);
            updatedList = Object.assign(updatedList, props.configuration[name]);
            updatedList.add(rc);
            props.onChange(name, updatedList);
            setAddRoomDialogOpen(false);
            setAddCorridorDialogOpen(false);
        }

        const handleRoomDefaultSelect = (rc: RoomCategory) => {
            props.onChange(nameOf<Configuration>("defaultRoomCategory"), rc);
            setAddRoomDialogOpen(false);
            setSelectingDefault(false);
        }

        const handleCorridorDefaultSelect = (cc: CorridorCategory) => {
            props.onChange(nameOf<Configuration>("defaultCorridorCategory"), cc);
            setAddCorridorDialogOpen(false);
            setSelectingDefault(false);
        }

        const handleRoomDefaultSave = (rc: RoomCategory) => {
            props.onChange(nameOf<Configuration>("defaultRoomCategory"), rc);
            setRoomCategoryToEdit(undefined);
            setRoomEditorOpen(false);
            setEditingDefault(false);
        }

        const handleCorridorDefaultSave = (cc: CorridorCategory) => {
            props.onChange(nameOf<Configuration>("defaultCorridorCategory"), cc);
            setCorridorCategoryToEdit(undefined);
            setCorridorEditorOpen(false);
            setEditingDefault(false);
        }

        const handleRoomClick = (rc: RoomCategory) => {
            if (props.selectCategory){
                props.selectCategory(rc);
            }
            setRoomCategoryToEdit(rc);
            setRoomEditorOpen(true);
        }

        const handleCorridorClick = (cc: CorridorCategory) => {
            if (props.selectCategory){
                props.selectCategory(cc);
            }
            setCorridorCategoryToEdit(cc);
            setCorridorEditorOpen(true);
        }

        const handleSave = (name: keyof Configuration, rc: RegionCategory) => {
            var updatedList = Object.create(Object.getPrototypeOf(props.configuration[name]) as Probabilities<any>);
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

        const getRoomCatList = () => {
			var objects = props.configuration.roomCategories.objects;
            if (!objects.find((item) => lodash.isEqual(item, props.configuration.defaultRoomCategory))) {
				return objects.concat([props.configuration.defaultRoomCategory]);
            }
            else{
                return objects;
            }
        }

        const getCorridorCatList = () => {
			var objects = props.configuration.corridorCategories.objects;
            if (!objects.filter((item) => lodash.isEqual(item, props.configuration.defaultCorridorCategory))) {
				return objects.concat([props.configuration.defaultCorridorCategory]);
            }
            else{
                return objects;
            }
        }

        return (
            <div style={{width: '100%'}}>
                <div className={classes.listLabel}>
                    <FormLabel disabled={disabled}>Room Categories</FormLabel>
                    <IconButton disabled={disabled} onClick={handleAddRoomClick} aria-label="add" color="primary">
                        <AddBoxIcon/>
                    </IconButton>
                </div>

                <NameList
                    disabled={disabled}
                    showDelete
                    list={getRoomCatList()}
                    onClick={handleRoomClick}
                    onDeleteClick={(index) => handleDeleteClick(nameOf<Configuration>("roomCategories"), index)}
                />      
                <div className={classes.listLabel}>
                    <FormLabel disabled={disabled}>Corridor Categories</FormLabel>
                    <IconButton disabled={disabled} onClick={handleAddCorridorClick} aria-label="add" color="primary">
                        <AddBoxIcon />
                    </IconButton>
                </div>
                <NameList
                    disabled={disabled}
                    showDelete
                    list={getCorridorCatList()}
                    onClick={handleCorridorClick}
                    onDeleteClick={(index) => handleDeleteClick(nameOf<Configuration>("corridorCategories"), index)}
                />
                {addRoomDialogOpen &&
                    <SelectRoomCategory
                        open={addRoomDialogOpen}
                        onlyAllowDefaults={selectingDefault}
                        exclude={selectingDefault ? [] : props.configuration.roomCategories.objects}
                        onSelect={(rc) => selectingDefault ? handleRoomDefaultSelect(rc) : handleSelect(nameOf<Configuration>("roomCategories"), rc)}
                        onCancelClick={() => {setAddRoomDialogOpen(false); setSelectingDefault(false);}}
                    />
                }
                {addCorridorDialogOpen &&
                    <SelectCorridorCategory
                        open={addCorridorDialogOpen}
                        onlyAllowDefaults={selectingDefault}
                        exclude={selectingDefault ? [] : props.configuration.corridorCategories.objects}
                        onSelect={(cc) =>  selectingDefault ? handleCorridorDefaultSelect(cc) : handleSelect(nameOf<Configuration>("corridorCategories"), cc)}
                        onCancelClick={()=>{setAddCorridorDialogOpen(false); setSelectingDefault(false);}}
                    />
                }
                {roomEditorOpen &&
                    <RoomCategoryEditor
                        viewOnly
                        open={roomEditorOpen}
                        roomCategory={roomCategoryToEdit}
                        savePhrase={props.savePhrase}
                        onSave={(rc: RoomCategory) => editingDefault ? handleRoomDefaultSave(rc) : handleSave(nameOf<Configuration>("roomCategories"), rc)}
                        onCancelClick={()=>setRoomEditorOpen(false)}
                    />
                }
                {corridorEditorOpen &&
                    <CorridorCategoryEditor
                        viewOnly
                        open={corridorEditorOpen}
                        corridorCategory={corridorCategoryToEdit}
                        savePhrase={props.savePhrase}
                        onSave={(cc: CorridorCategory) => editingDefault ? handleCorridorDefaultSave(cc) : handleSave(nameOf<Configuration>("corridorCategories"), cc)}
                        onCancelClick={()=>setCorridorEditorOpen(false)}
                    />
                }
            </div>
        );
    },
    (prevProps, nextProps) =>
        prevProps.configuration.roomCategories === nextProps.configuration.roomCategories &&
        prevProps.configuration.corridorCategories === nextProps.configuration.corridorCategories &&
        prevProps.configuration.defaultRoomCategory === nextProps.configuration.defaultRoomCategory &&
        prevProps.configuration.defaultCorridorCategory === nextProps.configuration.defaultCorridorCategory &&
        prevProps.configuration.premade === nextProps.configuration.premade &&
        prevProps.isSaving === nextProps.isSaving && 
        prevProps.savePhrase == nextProps.savePhrase
)


export default RegionLevelModify;