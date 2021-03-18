import { Button } from '@material-ui/core';
import React from 'react';
import MapLevelConfiguration from './MapLevelConfiguration';
import RegionLevelConfiguration from './RegionLevelConfiguration';

class Configuration extends React.Component {
    constructor(props) {
        super(props);
        // this.state = {isToggleOn: true};
    
        // This binding is necessary to make `this` work in the callback
        this.handleSave = this.handleSave.bind(this);
    }

    handleSave() {
        
    }

    render() {
        return (
            <div>
                <RegionLevelConfiguration></RegionLevelConfiguration>
                <MapLevelConfiguration></MapLevelConfiguration>
                <Button onClick={this.handleSave} variant="contained">Save</Button>
            </div>
        );
    }
}

export default Configuration;