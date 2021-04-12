import { default as firebaseKey } from "./certs/firebase_key.json"
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { BACKEND_URL } from "./constants/Backend"

export class AuthKeys {
    accessToken: string | null;
    refreshToken: string | null;
    idToken: string;
}

export class Authenticator {
    static provider = new firebase.auth.GoogleAuthProvider();

    static init() {
        this.provider.addScope('https://www.googleapis.com/auth/drive.readonly.metadata');
        this.provider.addScope('https://www.googleapis.com/auth/drive.file');
    }

    // REQ - 2: Request.Login - The system will compare the provided Google Account login with the database to see if there is a matching registered user.
    static async loginUser() {
        try {
            var result = await firebase.auth().signInWithPopup(this.provider) as any;
            localStorage.setItem('accessToken', result.credential.accessToken);
            localStorage.setItem('refreshToken', result.user.refreshToken);
            localStorage.setItem('lastRefreshTime', Date.now().toLocaleString());
            var token = await firebase.auth().currentUser?.getIdToken()
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: token })
            };

            var response = await fetch(`${BACKEND_URL}/login`, requestOptions);
            var data = await response.json();
            if (!data.valid) {
                await Authenticator.logoutUser();
            }
            return data
        } catch (error) {
            console.log(error);
        }
    }

    static async logoutUser(): Promise<boolean> {
        try {
            await firebase.auth().signOut();
            localStorage.setItem('accessToken', "");
            localStorage.setItem('refreshToken', "");
            localStorage.setItem('lastRefreshTime', "");
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    static isLoggedIn(): boolean {
        var user = firebase.auth().currentUser;
        if (user) {
            return true;
        } else {
            return false;
        }
    }

    static onAuthListener(func: (result: boolean) => void) {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                var lastRefreshTime: string | null = localStorage.getItem('lastRefreshTime')
                if (!lastRefreshTime) {
                    func(false);
                }
                else {
                    var oneHour = 60 * 60 * 1000; /* ms */
                    if ((Date.now() - Date.parse(lastRefreshTime)) > oneHour) {
                        // TODO: Refresh with token instead of logging in again
                        func(false);
                    }
                    func(true);
                }
            } else {
                func(false);
            }
        });
    }

    static async getIDToken() {
        return await firebase.auth().currentUser?.getIdToken();
    }

    static async getAllTokens() {
        // TODO: check for refresh here 
        return {
            accessToken: localStorage.getItem('accessToken'),
            refreshToken: localStorage.getItem('refreshToken'),
            idToken: await firebase.auth().currentUser?.getIdToken()
        } as AuthKeys
    }

    // REQ-1: Request.Registration - The system will allow the user to register a DMG account through a linked Google Account.
    static async registerUser() {
        try {
            var result = await firebase.auth().signInWithPopup(this.provider) as any;
            var accessToken = result.credential.accessToken;
            var refreshToken = result.user.refreshToken;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('lastRefreshTime', Date.now().toLocaleString());
            var token = await firebase.auth().currentUser?.getIdToken()
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idToken: token,
                    accessToken: accessToken,
                    refreshToken: refreshToken
                })
            };

            var response = await fetch(`${BACKEND_URL}/register`, requestOptions);
            var data = await response.json();
            return data
        } catch (error) {
            console.log(error);
        }
    }
}

if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseKey);
}

export default Authenticator;