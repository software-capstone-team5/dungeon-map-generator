import { Size } from "../constants/Size";
import { CorridorComplexity } from "../constants/CorridorComplexity";
import { CorridorLength } from "../constants/CorridorLength";
import DifficultySlider from './DifficultySlider';
import EnumRadio from './common/EnumRadio';
import {Configuration} from '../models/Configuration';
import {nameOf, valueOf} from '../utils/util';

type Props = {
    configuration: Configuration;
    onChange: (name: keyof Configuration, value: valueOf<Configuration>)=>void;
};

function MapLevelConfiguration(props: Props) {
    return (
        <div>
            <DifficultySlider onChange={(value: number) => props.onChange(nameOf<Configuration>("difficulty"), value)} initialValue={props.configuration.difficulty}/>
            <div>
                <EnumRadio<Size>
                    enum={Size}
                    label="Map Size"
                    initialValue={props.configuration.mapSize}
                    onChange={(value: Size) => props.onChange(nameOf<Configuration>("mapSize"), value)}/>
            </div>
            <div>
                <EnumRadio<CorridorComplexity>
                    enum={CorridorComplexity}
                    label="Corridor Complexity"
                    initialValue={props.configuration.corridorComplexity}
                    onChange={(value: CorridorComplexity) => props.onChange(nameOf<Configuration>("corridorComplexity"), value)}/>
            </div>
            <div>
                <EnumRadio<CorridorLength>
                    enum={CorridorLength}
                    label="Corridor Length"
                    initialValue={props.configuration.corridorLength}
                    onChange={(value: CorridorLength) => props.onChange(nameOf<Configuration>("corridorLength"), value)}/>
            </div>
        </div>
    );
}

export default MapLevelConfiguration;