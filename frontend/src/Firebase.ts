import { default as firebaseKey } from "./firebase_key.json"
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

export class Firebase {
    static provider = new firebase.auth.GoogleAuthProvider();
    // REQ - 2: Request.Login - The system will compare the provided Google Account login with the database to see if there is a matching registered user.
    static loginUser(): void {
        firebase.auth()
            .signInWithPopup(this.provider)
            .then((result) => {
                /** @type {firebase.auth.OAuthCredential} */
                var credential = result.credential as firebase.auth.OAuthCredential;

                if (credential != null) {
                    // This gives you a Google Access Token. You can use it to access the Google API.
                    var token = credential.accessToken;
                    // The signed-in user info.
                    var user = result.user;
                    console.log("Token: " + token);
                    console.log("User: " + user?.uid);
                }
            }).catch((error) => {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
            });
    }
}

firebase.initializeApp(firebaseKey);

export default Firebase;