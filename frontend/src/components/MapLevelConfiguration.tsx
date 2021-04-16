// REQ-12: Edit.MapLevelConfiguration.DifficultyLevel
// REQ-13: Edit.MapLevelConfiguration.Size
// REQ-14: Edit.MapLevelConfiguration.CorridorComplexity
// REQ-15: Edit.MapLevelConfiguration.CorridorLength

import React from 'react';
import { CorridorComplexity } from "../constants/CorridorComplexity";
import { CorridorLength } from "../constants/CorridorLength";
import { Size } from "../constants/Size";
import { Configuration } from '../models/Configuration';
import { nameOf, valueOf } from '../utils/util';
import EnumRadio from './common/EnumRadio';
import DifficultySlider from './DifficultySlider';

type Props = {
    isSaving: boolean;
    configuration: Configuration;
    onChange: (name: keyof Configuration, value: valueOf<Configuration>)=>void;
};

const MapLevelConfiguration = React.memo(
    (props: Props) => {

        var disabled = props.configuration.premade || props.isSaving
        return (
            <div>
                <DifficultySlider
                    disabled={disabled}
                    onChange={(value: number) => props.onChange(nameOf<Configuration>("difficulty"), value)}
                    value={props.configuration.difficulty}
                />
                <div>
                    <EnumRadio<Size>
                        disabled={disabled}
                        enum={Size}
                        label="Map Size"
                        value={props.configuration.mapSize}
                        onChange={(value: Size) => props.onChange(nameOf<Configuration>("mapSize"), value)}/>
                </div>
                <div>
                    <EnumRadio<CorridorComplexity>
                        disabled={disabled}
                        enum={CorridorComplexity}
                        label="Corridor Complexity"
                        value={props.configuration.corridorComplexity}
                        onChange={(value: CorridorComplexity) => props.onChange(nameOf<Configuration>("corridorComplexity"), value)}/>
                </div>
                <div>
                    <EnumRadio<CorridorLength>
                        disabled={disabled}
                        enum={CorridorLength}
                        label="Corridor Length"
                        value={props.configuration.corridorLength}
                        onChange={(value: CorridorLength) => props.onChange(nameOf<Configuration>("corridorLength"), value)}/>
                </div>
            </div>
        );
    },
    // TODO : Figure out why this doesn't work?
    // (prevProps, nextProps) =>
    //     // Returns true when we want to avoid rerendering
    //     prevProps.configuration.difficulty === nextProps.configuration.difficulty &&
    //     prevProps.configuration.mapSize === nextProps.configuration.mapSize &&
    //     prevProps.configuration.corridorComplexity === nextProps.configuration.corridorComplexity &&
    //     prevProps.configuration.corridorLength === nextProps.configuration.corridorLength
);

export default MapLevelConfiguration;