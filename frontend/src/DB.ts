import { default as firebaseKey } from "./certs/firebase_key.json"
import firebase from "firebase/app";
import "firebase/firestore";
import { Configuration } from './models/Configuration';
import { BACKEND_URL } from './constants/Backend';
import { plainToClass } from "class-transformer";
import { Authenticator } from './Authenticator';
import { RoomCategory } from "./models/RoomCategory";
import { CorridorCategory } from "./models/CorridorCategory";

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

    // REQ-28: Save.RoomCategory - The system should allow the user to save a Room Category that they have created in the database.
    static async saveRoomCategory(roomCategory: RoomCategory) {
        try {
            var token = await Authenticator.getIDToken();
            if (token === undefined) {
                return { "valid": false, "response": "Not logged in" };
            }
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roomCategory)
            };
            var response = await fetch(`${BACKEND_URL}/user/${token}/room`, requestOptions);
            var data = await response.json();
            return data
        } catch (error) {
            console.log(error);
        }
    }

    // REQ-37: Save.CorridorCategory - The system should allow the user to save a Corridor Category that they have created in the database.
    static async saveCorridorCategory(corridorCategory: CorridorCategory) {
        try {
            var token = await Authenticator.getIDToken();
            if (token === undefined) {
                return { "valid": false, "response": "Not logged in" };
            }
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(corridorCategory)
            };
            var response = await fetch(`${BACKEND_URL}/user/${token}/corridor`, requestOptions);
            var data = await response.json();
            return data
        } catch (error) {
            console.log(error);
        }
    }

    // REQ-18: Save.MapConfiguration - The system allows logged -in users to save the entire map configuration(both Map Level and Region Level) as a Preset.
    static async getAllConfig() {
        try {
            var token = await Authenticator.getIDToken();
            if (token === undefined) {
                return { valid: false, "response": "Not Logged In" }; // Not sure how we want to handle
            }
            const requestOptions = {
                method: 'GET'
            };
            var response = await fetch(`${BACKEND_URL}/user/${token}/config`, requestOptions);
            var data = await response.json();
            if (!data.valid) {
                return data;
            }
            var configs: Configuration[] = [];
            data.response.forEach((element: Object) => {
                configs.push(plainToClass(Configuration, element))
            });
            // var config = plainToClass(Configuration, data.config)
            var emptyConfig = new Configuration();
            console.log(configs);
            console.log(emptyConfig);
            return { valid: true, "response": configs };
        } catch (error) {
            console.log(error);
        }
    }
}

if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseKey);
}

export default DB;