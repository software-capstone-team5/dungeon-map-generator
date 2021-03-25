import React from 'react';
import GoogleLogin from 'react-google-login';

// REQ - 2: Request.Login - The system will compare the provided Google Account login with the database to see if there is a matching registered user.
const clientId = "1090934025997-97s914sitcfv4sj9hicuves3c0rvskkh.apps.googleusercontent.com";

function LoginOld() {
    const onSuccess = (response) => {
        console.log('Login success currentUser: ', response.googleId);
        requestLoginUser(response.googleId);
        refreshTokenSetup(response);
    }

    const onFailure = (response) => {
        console.log('Login failed: ', response);
    }

    const requestLoginUser = (googleId) => {
        fetch(`http://localhost:5000/getUser?id=${encodeURI(googleId)}`)
            .then(res => res.json())
            .then(
                (result) => {
                    console.log(result);
                }
            )
    }

    const refreshTokenSetup = (response) => {
        let refreshTiming = (response.tokenObj.expires_in || 3600 - 5 * 60) * 1000;

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

export default LoginOld