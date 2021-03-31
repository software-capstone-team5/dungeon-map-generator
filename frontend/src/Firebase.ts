import { default as firebaseKey } from "./firebase_key.json"
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

export class Firebase {
    static provider = new firebase.auth.GoogleAuthProvider();
    // REQ - 2: Request.Login - The system will compare the provided Google Account login with the database to see if there is a matching registered user.
    static async loginUser() {
        try {
            await firebase.auth().signInWithPopup(this.provider);
            var message = await this.getUser();
            return message;
        } catch (error) {
            console.log(error);
        }
    }

    static async getUser() {
        var token = await firebase.auth().currentUser?.getIdToken()
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: token })
        };

        var response = await fetch(`http://localhost:5000/login`, requestOptions);
        var data = await response.json();
        return data
    }
}

if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseKey);
}

export default Firebase;