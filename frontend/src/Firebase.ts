import { default as firebaseKey } from "./certs/firebase_key.json"
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { Configuration } from './models/Configuration';

export class Firebase {
    static provider = new firebase.auth.GoogleAuthProvider();
    static BACKEND_URL = "http://localhost:5000";
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

            var response = await fetch(`${this.BACKEND_URL}/login`, requestOptions);
            var data = await response.json();
            return data
        } catch (error) {
            console.log(error);
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

            var response = await fetch(`${this.BACKEND_URL}/register`, requestOptions);
            var data = await response.json();
            return data
        } catch (error) {
            console.log(error);
        }
    }

    // REQ-18: Save.MapConfiguration - The system allows logged -in users to save the entire map configuration(both Map Level and Region Level) as a Preset.
    static async saveConfig(config: Configuration) {
        try {
            var token = await firebase.auth().currentUser?.getIdToken()
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            };
            var response = await fetch(`${this.BACKEND_URL}/user/${token}/config`, requestOptions);
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

export default Firebase;