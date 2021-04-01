import React from 'react';

import { Button } from '@material-ui/core';

import { Firebase } from './Firebase';
// REQ - 2: Request.Login - The system will compare the provided Google Account login with the database to see if there is a matching registered user.
export default class Login extends React.Component {


    async handleSave() {
        var result = await Firebase.loginUser();
        if (result) {
            if (result.valid) {
                // TODO Update button state for valid login
            } else {
                window.alert(result.response)
            }
        }
    }

    render() {
        return (
            <Button onClick={this.handleSave} variant="contained">Login</Button>
        )
    }
}