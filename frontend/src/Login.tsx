import React from 'react';

import { Button } from '@material-ui/core';

import { Firebase } from './Firebase';
// REQ - 2: Request.Login - The system will compare the provided Google Account login with the database to see if there is a matching registered user.
class Login extends React.Component {


    handleSave() {
        Firebase.loginUser();
    }

    render() {
        return (
            <Button onClick={this.handleSave} variant="contained">Login</Button>
        )
    }
}

export default Login