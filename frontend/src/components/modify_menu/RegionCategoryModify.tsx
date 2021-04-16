import { makeStyles } from '@material-ui/core';
import FormLabel from '@material-ui/core/FormLabel';
import { memo, useState } from 'react';
import { Probabilities } from '../../generator/Probabilities';
import { Configuration } from '../../models/Configuration';
import { CorridorCategory } from '../../models/CorridorCategory';
import { RegionCategory } from '../../models/RegionCategory';
import { RoomCategory } from '../../models/RoomCategory';
import { nameOf } from '../../utils/util';
import NameList from "../common/NameList";
import CorridorCategoryEditor from '../CorridorCategoryEditor';
import RoomCategoryEditor from '../RoomCategoryEditor';

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
    onChange: (name: keyof Configuration, index:number, value: RegionCategory) => void;
    onRegenerateClick: (name: keyof Configuration, index: number) => void;
    onAddRegionClick: (name: keyof Configuration, index: number) => void;
    selectCategory?: (category: RegionCategory) => void;
}

const RegionCategoryModify = memo(
    (props: Props) => {
        var disabled = props.isSaving;

        const classes = useStyles();
        const [roomCategoryEditorOpen, setRoomCategoryEditorOpen] = useState(false);
        const [roomCategoryToEdit, setRoomCategoryToEdit] = useState<RoomCategory>();
        const [corridorCategoryEditorOpen, setCorridorEditorOpen] = useState(false);
        const [corridorCategoryToEdit, setCorridorCategoryToEdit] = useState<CorridorCategory>();
        const [editingDefault, setEditingDefault] = useState(false);
        
        const handleRoomClick = (rc: RoomCategory) => {
            if (rc === props.configuration.defaultRoomCategory){
                setEditingDefault(true);
            }
            setRoomCategoryToEdit(rc);
            setRoomCategoryEditorOpen(true);
        }

        const handleCorridorClick = (cc: CorridorCategory) => {
            if (cc === props.configuration.defaultCorridorCategory){
                setEditingDefault(true);
            }
            setCorridorCategoryToEdit(cc);
            setCorridorEditorOpen(true);
        }

        const handleSave = (name: keyof Configuration, rc: RegionCategory) => {
            var index = -1;
            if (roomCategoryToEdit !== undefined) {
                index = (props.configuration[name] as Probabilities<RoomCategory>).objects.indexOf(roomCategoryToEdit);
            } else if (corridorCategoryToEdit !== undefined) {
                index = (props.configuration[name] as Probabilities<CorridorCategory>).objects.indexOf(corridorCategoryToEdit);
            }
            
            props.onChange(name, index, rc);
            setRoomCategoryEditorOpen(false);
            setCorridorEditorOpen(false);
            setRoomCategoryToEdit(undefined);
            setCorridorCategoryToEdit(undefined);
            setEditingDefault(false);
        }

        return (
            <div style={{width: '100%'}}>
                <div className={classes.listLabel}>
                    <FormLabel disabled={disabled}>Room Categories</FormLabel>
                </div>

                <NameList
                    disabled={disabled}
                    showRegenerate
                    showSelection
                    showAdd
                    onlyShowSelectedIcons
                    doubleClick
                    list={props.configuration.roomCategories.objects}
                    selectedIndex={props.selectedRoomCategoryIndex}
                    onSelect={props.selectCategory}
                    onClick={handleRoomClick}
                    onRegenerateClick={(index: number) => props.onRegenerateClick(nameOf<Configuration>("roomCategories"), index)}
                    onAddClick={(index: number) => props.onAddRegionClick(nameOf<Configuration>("roomCategories"), index)}
                />      
                <div className={classes.listLabel}>
                    <FormLabel disabled={disabled}>Corridor Categories</FormLabel>
                </div>
                <NameList
                    disabled={disabled}
                    showRegenerate
                    showSelection
                    showAdd
                    onlyShowSelectedIcons
                    doubleClick
                    list={props.configuration.corridorCategories.objects}
                    selectedIndex={props.selectedCorridorCategoryIndex}
                    onSelect={props.selectCategory}
                    onClick={handleCorridorClick}
                    onRegenerateClick={(index: number) => props.onRegenerateClick(nameOf<Configuration>("corridorCategories"), index)}
                    onAddClick={(index: number) => props.onAddRegionClick(nameOf<Configuration>("corridorCategories"), index)}
                />
                {roomCategoryEditorOpen &&
                    <RoomCategoryEditor
                        isDefault={editingDefault}
                        open={roomCategoryEditorOpen}
                        roomCategory={roomCategoryToEdit}
                        savePhrase={props.savePhrase}
                        saveToDB={false}
                        onSave={(rc: RoomCategory) => handleSave(nameOf<Configuration>("roomCategories"), rc)}
                        onCancelClick={()=>setRoomCategoryEditorOpen(false)}
                    />
                }
                {corridorCategoryEditorOpen &&
                    <CorridorCategoryEditor
                        isDefault={editingDefault}
                        open={corridorCategoryEditorOpen}
                        corridorCategory={corridorCategoryToEdit}
                        savePhrase={props.savePhrase}
                        saveToDB={false}
                        onSave={(cc: CorridorCategory) => handleSave(nameOf<Configuration>("corridorCategories"), cc)}
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
        prevProps.selectedCorridorCategoryIndex === nextProps.selectedCorridorCategoryIndex &&
        prevProps.selectedRoomCategoryIndex === nextProps.selectedRoomCategoryIndex
)


export default RegionCategoryModify;