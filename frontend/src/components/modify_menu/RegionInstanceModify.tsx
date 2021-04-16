import { makeStyles } from '@material-ui/core';
import FormLabel from '@material-ui/core/FormLabel';
import { memo, useState } from 'react';
import { DungeonMap } from '../../models/DungeonMap';
import { RegionInstance } from '../../models/RegionInstance';
import { RoomInstance } from '../../models/RoomInstance';
import { nameOf, valueOf } from '../../utils/util';
import NameList from "../common/NameList";
import RoomEditor from './RoomEditor';
import { CorridorInstance } from '../../models/CorridorInstance';
import CorridorEditor from './CorridorEditor';

const useStyles = makeStyles({
    listLabel: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
});

type Props = {
    isSaving: boolean;
    map: DungeonMap;
    savePhrase?: string;
    selectedRoomIndex?: number;
    selectedCorridorIndex?: number;
    onChange: (name: keyof DungeonMap, index:number, value: RegionInstance) => void;
    onRegenerateClick: (name: keyof DungeonMap, index: number) => void;
    onDeleteClick: (name: keyof DungeonMap, index: number) => void;
    selectInstance?: (category: RegionInstance) => void;
}

const RegionInstanceModify = memo(
    (props: Props) => {
        var disabled = props.isSaving;

        const classes = useStyles();
        const [roomEditorOpen, setRoomEditorOpen] = useState(false);
        const [corridorEditorOpen, setCorridorEditorOpen] = useState(false);
        const [roomToEdit, setRoomToEdit] = useState<RoomInstance>();
        const [corridorToEdit, setCorridorToEdit] = useState<CorridorInstance>();

        const handleRoomClick = (ri: RoomInstance) => {
            setRoomToEdit(ri);
            setRoomEditorOpen(true);
        }

        const handleCorridorClick = (ci: CorridorInstance) => {
            setCorridorToEdit(ci);
            setCorridorEditorOpen(true);
        }

        const handleSave = (name: keyof DungeonMap, ri: RegionInstance) => {
			var index = -1;
            if (roomToEdit !== undefined) {
				index = (props.map[name] as RoomInstance[]).indexOf(roomToEdit);
            } else if (corridorToEdit !== undefined) {
				index = (props.map[name] as CorridorInstance[]).indexOf(corridorToEdit);
            }
            
            props.onChange(name, index, ri);
            setRoomEditorOpen(false);
            setCorridorEditorOpen(false);
            setRoomToEdit(undefined);
            setCorridorToEdit(undefined);
        }

        return (
            <div style={{width: '100%', maxWidth: '90%'}}>
                <div className={classes.listLabel}>
                    <FormLabel disabled={disabled}>Rooms</FormLabel>
                </div>

                <NameList
                    disabled={disabled}
                    showRegenerate
                    showDelete
                    showSelection
                    onlyShowSelectedIcons
                    doubleClick
                    list={props.map.rooms}
                    selectedIndex={props.selectedRoomIndex}
                    onClick={handleRoomClick}
                    onSelect={props.selectInstance}
                    onDeleteClick={(index) => props.onDeleteClick(nameOf<DungeonMap>("rooms"), index)}
                    onRegenerateClick={(index) => props.onRegenerateClick(nameOf<DungeonMap>("rooms"), index)}
                />      
                <div className={classes.listLabel}>
                    <FormLabel disabled={disabled}>Corridors</FormLabel>
                </div>
                <NameList
                    disabled={disabled}
                    showRegenerate
                    showDelete
                    showSelection
                    onlyShowSelectedIcons
                    doubleClick
                    list={props.map.corridors}
                    selectedIndex={props.selectedCorridorIndex}
                    onClick={handleCorridorClick}
                    onSelect={props.selectInstance}
                    onDeleteClick={(index) => props.onDeleteClick(nameOf<DungeonMap>("corridors"), index)}
                    onRegenerateClick={(index) => props.onRegenerateClick(nameOf<DungeonMap>("corridors"), index)}
                />
                {roomEditorOpen &&
                    <RoomEditor
                        open={roomEditorOpen}
                        room={roomToEdit}
                        savePhrase={props.savePhrase}
                        onSave={(ri: RoomInstance) => handleSave(nameOf<DungeonMap>("rooms"), ri)}
                        onCancelClick={()=>setRoomEditorOpen(false)}
                    />
                }
                {corridorEditorOpen &&
                    <CorridorEditor
                        open={corridorEditorOpen}
                        corridor={corridorToEdit}
                        savePhrase={props.savePhrase}
                        onSave={(ci: CorridorInstance) => handleSave(nameOf<DungeonMap>("corridors"), ci)}
                        onCancelClick={()=>setCorridorEditorOpen(false)}
                    />
                }
            </div>
        );
    },
    (prevProps, nextProps) =>
        prevProps.map.rooms === nextProps.map.rooms &&
        prevProps.map.corridors === nextProps.map.corridors &&
        prevProps.isSaving === nextProps.isSaving && 
        prevProps.savePhrase === nextProps.savePhrase && 
        prevProps.selectedCorridorIndex === nextProps.selectedCorridorIndex &&
        prevProps.selectedRoomIndex === nextProps.selectedRoomIndex
)


export default RegionInstanceModify;