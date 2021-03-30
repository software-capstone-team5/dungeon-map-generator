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
                this.getUser();
            }).catch((error) => {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
            });
    }

    static getUser(): void {
        firebase.auth().currentUser?.getIdToken()
            .then(function (token) {
                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken: token })
                };

                fetch(`http://localhost:5000/login`, requestOptions)
                    .then(res => res.json())
                    .then(
                        (result) => {
                            console.log(result);
                        }
                    );
            })
    }
}

if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseKey);
}

export default Firebase;