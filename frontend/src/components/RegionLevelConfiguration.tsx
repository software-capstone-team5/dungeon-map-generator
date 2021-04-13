import { makeStyles } from '@material-ui/core';
import FormLabel from '@material-ui/core/FormLabel';
import IconButton from '@material-ui/core/IconButton';
import AddBoxIcon from '@material-ui/icons/AddBox';
import ListIcon from '@material-ui/icons/List';
import { memo, useState } from 'react';
import { Probabilities } from '../generator/Probabilities';
import { Configuration } from '../models/Configuration';
import { CorridorCategory } from '../models/CorridorCategory';
import { RegionCategory } from '../models/RegionCategory';
import { RoomCategory } from '../models/RoomCategory';
import { nameOf, valueOf } from '../utils/util';
import NameList from "./common/NameList";
import ProbabilityNameList from "./common/ProbabilityNameList";
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
    onChange: (name: keyof Configuration, value: valueOf<Configuration>)=>void;
}

const RegionLevelConfiguration = memo(
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

        const handleSelectDefaultRoomClick = () => {
            setSelectingDefault(true);
            setAddRoomDialogOpen(true);
        }

        const handleSelectDefaultCorridorClick = () => {
            setSelectingDefault(true);
            setAddCorridorDialogOpen(true);
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

        const handleDefaultRoomClick = (rc: RoomCategory) => {
            setRoomCategoryToEdit(rc);
            setEditingDefault(true);
            setRoomEditorOpen(true);
        }

        const handleDefaultCorridorClick = (cc: CorridorCategory) => {
            setCorridorCategoryToEdit(cc);
            setEditingDefault(true);
            setCorridorEditorOpen(true);
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
            setRoomCategoryToEdit(rc);
            setRoomEditorOpen(true);
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
            setRoomEditorOpen(false);
            setCorridorEditorOpen(false);
            setRoomCategoryToEdit(undefined);
            setCorridorCategoryToEdit(undefined);
        }

        return (
            <div style={{width: '100%'}}>
                <div className={classes.listLabel}>
                    <FormLabel disabled={disabled} required>Default Room</FormLabel>
                    <IconButton disabled={disabled} onClick={handleSelectDefaultRoomClick} aria-label="add" color="primary">
                        <ListIcon/>
                    </IconButton>
                </div>
                <NameList
                    disabled={disabled && !props.configuration.premade}
                    onClick={handleDefaultRoomClick}
                    list={props.configuration.defaultRoomCategory ? [props.configuration.defaultRoomCategory] : []}
                />
                <div className={classes.listLabel}>
                    <FormLabel disabled={disabled}>Rooms</FormLabel>
                    <IconButton disabled={disabled} onClick={handleAddRoomClick} aria-label="add" color="primary">
                        <AddBoxIcon/>
                    </IconButton>
                </div>

                <ProbabilityNameList
                    disableListItem={disabled && !props.configuration.premade}
                    disableProbs={disabled}
                    showProbs
                    showDelete={!disabled}
                    list={props.configuration.roomCategories}
                    onClick={handleRoomClick}
                    onDeleteClick={(index) => handleDeleteClick(nameOf<Configuration>("roomCategories"), index)}
                    onProbUpdate={(newList) => props.onChange(nameOf<Configuration>("roomCategories"), newList!)}
                />
                <div className={classes.listLabel}>
                    <FormLabel disabled={disabled} required>Default Corridor</FormLabel>
                    <IconButton disabled={disabled} onClick={handleSelectDefaultCorridorClick} aria-label="add" color="primary">
                        <ListIcon/>
                    </IconButton>
                </div>
                <NameList
                    disabled={disabled && !props.configuration.premade}
                    onClick={handleDefaultCorridorClick}
                    list={props.configuration.defaultCorridorCategory ? [props.configuration.defaultCorridorCategory] : []}
                />
                <div className={classes.listLabel}>
                    <FormLabel disabled={disabled}>Corridors</FormLabel>
                    <IconButton disabled={disabled} onClick={handleAddCorridorClick} aria-label="add" color="primary">
                        <AddBoxIcon />
                    </IconButton>
                </div>
                <ProbabilityNameList
                    disableListItem={disabled && !props.configuration.premade}
                    disableProbs={disabled}
                    showProbs
                    showDelete={!disabled}
                    list={props.configuration.corridorCategories}
                    onClick={handleCorridorClick}
                    onDeleteClick={(index) => handleDeleteClick(nameOf<Configuration>("corridorCategories"), index)}
                    onProbUpdate={(newList) => props.onChange(nameOf<Configuration>("corridorCategories"), newList!)}
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
                        onSave={(rc: RoomCategory) => editingDefault ? handleRoomDefaultSave(rc) : handleSave(nameOf<Configuration>("roomCategories"), rc)}
                        onCancelClick={()=>setRoomEditorOpen(false)}
                    />
                }
                {corridorEditorOpen &&
                    <CorridorCategoryEditor
                        viewOnly
                        open={corridorEditorOpen}
                        corridorCategory={corridorCategoryToEdit}
                        onSave={(cc: CorridorCategory) => editingDefault ? handleCorridorDefaultSave(cc) : handleSave(nameOf<Configuration>("corridorCategories"), cc)}
                        onCancelClick={()=>setCorridorEditorOpen(false)}
                    />
                }
            </div>
        );
    },
    // (prevProps, nextProps) =>
    //     prevProps.configuration.roomCategories === nextProps.configuration.roomCategories &&
    //     prevProps.configuration.corridorCategories === nextProps.configuration.corridorCategories &&
    //     prevProps.configuration.defaultRoomCategory === nextProps.configuration.defaultRoomCategory &&
    //     prevProps.configuration.defaultCorridorCategory === nextProps.configuration.defaultCorridorCategory &&
    //     prevProps.configuration.premade === nextProps.configuration.premade &&
    //     prevProps.isSaving === nextProps.isSaving
)


export default RegionLevelConfiguration;