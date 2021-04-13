import { makeStyles } from '@material-ui/core';
import FormLabel from '@material-ui/core/FormLabel';
import IconButton from '@material-ui/core/IconButton';
import AddBoxIcon from '@material-ui/icons/AddBox';
import { memo, useState } from 'react';
import { Probabilities } from '../../generator/Probabilities';
import { Configuration } from '../../models/Configuration';
import { CorridorCategory } from '../../models/CorridorCategory';
import { RegionCategory } from '../../models/RegionCategory';
import { RoomCategory } from '../../models/RoomCategory';
import { nameOf, valueOf } from '../../utils/util';
import NameList from "../common/NameList";
import CorridorCategoryEditor from '../CorridorCategoryEditor';
import RoomCategoryEditor from '../RoomCategoryEditor';
import SelectCorridorCategory from '../select/SelectCorridorCategory';
import SelectRoomCategory from '../select/SelectRoomCategory';

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
    selectedRoomCategoryIndex?: number;
    selectedCorridorCategoryIndex?: number;
    onChange: (name: keyof Configuration, value: valueOf<Configuration>)=>void;
    onRegenerateClick: (name: keyof Configuration, index: number) => void;
    selectCategory?: (category: RegionCategory) => void;
}

const RegionCategoryModify = memo(
    (props: Props) => {
        var disabled = props.isSaving;

        const classes = useStyles();
        const [addRoomDialogOpen, setAddRoomDialogOpen] = useState(false);
        const [addCorridorDialogOpen, setAddCorridorDialogOpen] = useState(false);
        const [roomCategoryEditorOpen, setRoomCategoryEditorOpen] = useState(false);
        const [roomCategoryToEdit, setRoomCategoryToEdit] = useState<RoomCategory>();
        const [corridorCategoryEditorOpen, setCorridorEditorOpen] = useState(false);
        const [corridorCategoryToEdit, setCorridorCategoryToEdit] = useState<CorridorCategory>();
        const [editingDefault, setEditingDefault] = useState(false);
        const [selectingDefault, setSelectingDefault] = useState(false);

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
            setRoomCategoryEditorOpen(false);
            setEditingDefault(false);
        }

        const handleCorridorDefaultSave = (cc: CorridorCategory) => {
            props.onChange(nameOf<Configuration>("defaultCorridorCategory"), cc);
            setCorridorCategoryToEdit(undefined);
            setCorridorEditorOpen(false);
            setEditingDefault(false);
        }

        const handleRoomClick = (rc: RoomCategory) => {
            setRoomCategoryToEdit(rc);
            setRoomCategoryEditorOpen(true);
        }

        const handleCorridorClick = (cc: CorridorCategory) => {
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
            setRoomCategoryEditorOpen(false);
            setCorridorEditorOpen(false);
            setRoomCategoryToEdit(undefined);
            setCorridorCategoryToEdit(undefined);
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
                    showRegenerate
                    showSelection
                    // showAdd
                    onlyShowSelectedIcons
                    doubleClick
                    list={props.configuration.roomCategories.objects}
                    selectedIndex={props.selectedRoomCategoryIndex}
                    onSelect={props.selectCategory}
                    onClick={handleRoomClick}
                    onRegenerateClick={(index) => props.onRegenerateClick(nameOf<Configuration>("roomCategories"), index)}
                />      
                <div className={classes.listLabel}>
                    <FormLabel disabled={disabled}>Corridor Categories</FormLabel>
                    <IconButton disabled={disabled} onClick={handleAddCorridorClick} aria-label="add" color="primary">
                        <AddBoxIcon />
                    </IconButton>
                </div>
                <NameList
                    disabled={disabled}
                    showRegenerate
                    showSelection
                    // showAdd
                    onlyShowSelectedIcons
                    doubleClick
                    list={props.configuration.corridorCategories.objects}
                    selectedIndex={props.selectedCorridorCategoryIndex}
                    onSelect={props.selectCategory}
                    onClick={handleCorridorClick}
                    onRegenerateClick={(index) => props.onRegenerateClick(nameOf<Configuration>("corridorCategories"), index)}
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
                {roomCategoryEditorOpen &&
                    <RoomCategoryEditor
                        isDefault={editingDefault}
                        open={roomCategoryEditorOpen}
                        roomCategory={roomCategoryToEdit}
                        savePhrase={props.savePhrase}
                        onSave={(rc: RoomCategory) => editingDefault ? handleRoomDefaultSave(rc) : handleSave(nameOf<Configuration>("roomCategories"), rc)}
                        onCancelClick={()=>setRoomCategoryEditorOpen(false)}
                    />
                }
                {corridorCategoryEditorOpen &&
                    <CorridorCategoryEditor
                        isDefault={editingDefault}
                        open={corridorCategoryEditorOpen}
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
        prevProps.savePhrase === nextProps.savePhrase &&
        prevProps.selectedCorridorCategoryIndex == nextProps.selectedCorridorCategoryIndex &&
        prevProps.selectedRoomCategoryIndex == nextProps.selectedRoomCategoryIndex
)


export default RegionCategoryModify;