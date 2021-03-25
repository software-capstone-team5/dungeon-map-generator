import React from 'react';
import { Size } from "./constants/Size";
import { CorridorComplexity } from "./constants/CorridorComplexity";
import { CorridorLength } from "./constants/CorridorLength";
import DifficultySlider from './DifficultySlider';
import EnumRadio from './EnumRadio';
import {Configuration} from './models/Configuration';
import {nameOf, valueOf} from './utils/util';

type Props = {
    configuration: Configuration;
    onChange: (name: keyof Configuration, value: valueOf<Configuration>)=>void;
};

function MapLevelConfiguration(props: Props) {
    return (
        <div>
            <DifficultySlider onChange={props.onChange} initialValue={props.configuration.difficulty}/>
            <div>
                <EnumRadio<Size>
                    enum={Size}
                    callbackPropertyName={nameOf<Configuration>("mapSize")}
                    onChange={props.onChange}
                    initialValue={props.configuration.mapSize}
                    label="Map Size"/>
            </div>
            <div>
                <EnumRadio<CorridorComplexity>
                    enum={CorridorComplexity}
                    callbackPropertyName={nameOf<Configuration>("corridorComplexity")}
                    onChange={props.onChange}
                    initialValue={props.configuration.corridorComplexity}
                    label="Corridor Complexity"/>
            </div>
            <div>
                <EnumRadio<CorridorLength>
                    enum={CorridorLength}
                    callbackPropertyName={nameOf<Configuration>("corridorLength")}
                    onChange={props.onChange}
                    initialValue={props.configuration.corridorLength}
                    label="Corridor Length"/>
            </div>
        </div>
    );
}

export default MapLevelConfiguration;