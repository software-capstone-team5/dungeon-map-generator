import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

export class Firebase {

    private provider = new firebase.auth.GoogleAuthProvider();

    loginUser() {
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
                }
            }).catch((error) => {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
            });
    }
}