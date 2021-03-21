import React from 'react';
import GoogleLogin from 'react-google-login';

// REQ-1: Request.Registration - The system will allow the user to register a DMG account through a linked Google Account.

const clientId = "1090934025997-97s914sitcfv4sj9hicuves3c0rvskkh.apps.googleusercontent.com";

function Login() {
    const onSuccess = (response) => {
        console.log('Login success currentUser: ', response.profileObj);

        refreshTokenSetup(response);
    }

    const onFailure = (response) => {
        console.log('Login failed: ', response);
    }

    const refreshTokenSetup = (response) => {
        let refreshTiming = (response.tokenObj.expires_in || 3600 - 5 * 60) * 1000;
        console.log("Here");
        const refreshToken = async () => {
            const newAuthResponse = await response.reloadAuthResponse();
            refreshTiming = (newAuthResponse.expires_in || 3600 - 5 * 60) * 1000;
            // saveUserToken(newAuthResponse.access_token);

            console.log("New Auth Response: ", newAuthResponse);
            console.log("New Auth ID: ", newAuthResponse.id_token);

            setTimeout(refreshToken, refreshTiming);
        };
        setTimeout(refreshToken, refreshTiming);
    }
    return (
        <div>
            <GoogleLogin
                clientId={clientId}
                buttonText="Login"
                onSuccess={onSuccess}
                onFailure={onFailure}
                cookiePolicy={'single_host_origin'}
                style={{ marginTop: '100px' }}
                isSignedIn={true}
            />
        </div>
    )
}

export default Login