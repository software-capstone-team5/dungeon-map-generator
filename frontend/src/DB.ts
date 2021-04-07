import { default as firebaseKey } from "./certs/firebase_key.json"
import firebase from "firebase/app";
import "firebase/firestore";
import { Configuration } from './models/Configuration';
import { BACKEND_URL } from './constants/Backend';
import { plainToClass } from "class-transformer";
import { Authenticator } from './Authenticator';

export class DB {

    // REQ-18: Save.MapConfiguration - The system allows logged -in users to save the entire map configuration(both Map Level and Region Level) as a Preset.
    static async saveConfig(config: Configuration) {
        try {
            var token = await Authenticator.getIDToken();
            if (token === undefined) {
                return { "valid": false, "response": "Not logged in" };
            }
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            };
            var response = await fetch(`${BACKEND_URL}/user/${token}/config`, requestOptions);
            var data = await response.json();
            return data
        } catch (error) {
            console.log(error);
        }
    }

    static async getConfig(name: string) { // WIP
        try {
            var token = await Authenticator.getIDToken();
            if (token === undefined) {
                return { valid: false, "response": "Not Logged In" }; // Not sure how we want to handle
            }
            const requestOptions = {
                method: 'GET'
            };
            var response = await fetch(`${BACKEND_URL}/user/${token}/config/${name}`, requestOptions);
            var data = await response.json();
            var config = plainToClass(Configuration, data.config)
            var emptyConfig = new Configuration();
            // Object.assign(config, data.config)
            console.log(config);
            console.log(emptyConfig);
            return { valid: true, "response": config };
        } catch (error) {
            console.log(error);
        }
    }
}

if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseKey);
}

export default DB;