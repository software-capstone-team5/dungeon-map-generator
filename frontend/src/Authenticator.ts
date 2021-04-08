import { default as firebaseKey } from "./certs/firebase_key.json"
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

export class Authenticator {
    static provider = new firebase.auth.GoogleAuthProvider();
    // REQ - 2: Request.Login - The system will compare the provided Google Account login with the database to see if there is a matching registered user.
    static async loginUser() {
        try {
            await firebase.auth().signInWithPopup(this.provider);
            var token = await firebase.auth().currentUser?.getIdToken()
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: token })
            };

            var response = await fetch(`http://localhost:5000/login`, requestOptions);
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
            return true;
        } catch(err) {
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

    // REQ-1: Request.Registration - The system will allow the user to register a DMG account through a linked Google Account.
    static async registerUser() {
        try {
            await firebase.auth().signInWithPopup(this.provider);
            var token = await firebase.auth().currentUser?.getIdToken()
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: token })
            };

            var response = await fetch(`http://localhost:5000/register`, requestOptions);
            var data = await response.json();
            if (!data.valid) {
                await Authenticator.logoutUser();
            }
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