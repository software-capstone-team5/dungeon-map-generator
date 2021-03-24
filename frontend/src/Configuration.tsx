import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import { Button, Typography, AccordionDetails } from '@material-ui/core';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import MapLevelConfiguration from './MapLevelConfiguration';
import RegionLevelConfiguration from './RegionLevelConfiguration';


const AccordionSummary = withStyles({
    root: {
      backgroundColor: 'rgba(0, 0, 0, .03)',
      borderBottom: '1px solid rgba(0, 0, 0, .125)',
      marginBottom: -1,
      minHeight: 56,
      '&$expanded': {
        minHeight: 56,
      },
    },
    content: {
      '&$expanded': {
        margin: '12px 0',
      },
    },
    expanded: {},
  })(MuiAccordionSummary);

const Accordion = withStyles({
root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:before': {
    display: 'none',
    },
    '&$expanded': {
    margin: 'auto',
    },
},
expanded: {},
})(MuiAccordion);


class Configuration extends React.Component {
    constructor(props: any) {
        super(props);
        // this.state = {isToggleOn: true};
    
        // This binding is necessary to make `this` work in the callback
        this.handleSave = this.handleSave.bind(this);
    }

    handleSave() {
        
    }

    handleInputChange() {
        
    }

    render() {
        return (
            <div>
                <form>
                    <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography>Map Level Options</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <MapLevelConfiguration />
                        </AccordionDetails>
                    </Accordion>
                    <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel2a-content"
                            id="panel2a-header"
                        >
                            <Typography>Region Level Options</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                        <Typography>
                            <RegionLevelConfiguration/>
                        </Typography>
                        </AccordionDetails>
                    </Accordion>
                        
                    <Button onClick={this.handleSave} variant="contained">Save</Button>
                </form>
            </div>
        );
    }
}

export default Configuration;