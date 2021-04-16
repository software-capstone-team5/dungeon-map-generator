import { plainToClass } from "class-transformer";
import firebase from "firebase/app";
import "firebase/firestore";
import { Authenticator } from './Authenticator';
import { default as firebaseKey } from "./certs/firebase_key.json";
import { BACKEND_URL } from './constants/Backend';
import { TileType } from "./constants/TileType";
import { Configuration } from './models/Configuration';
import { CorridorCategory } from "./models/CorridorCategory";
import { Item } from "./models/Item";
import { Monster } from "./models/Monster";
import { RoomCategory } from "./models/RoomCategory";
import { Trap } from "./models/Trap";

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
            var fetchString = token ? `${BACKEND_URL}/user/${token}/config` : `${BACKEND_URL}/config`

            const requestOptions = {
                method: 'GET'
            };
            var response = await fetch(fetchString, requestOptions);
            var data = await response.json();
            if (!data.valid) {
                return data;
            }
            var configs: Configuration[] = [];
            data.response.forEach((element: Object) => {
                configs.push(plainToClass(Configuration, element))
            });
            return { valid: true, "response": configs };
        } catch (error) {
            console.log(error);
        }
    }

    static async getConfigByID(id: string, premade: boolean) {
        try {
            var token = await Authenticator.getIDToken();
            if (token === undefined && !premade) {
                return { valid: false, "response": "Not Logged In" };
            }
            var fetchString = premade ? `${BACKEND_URL}/config/${id}` : `${BACKEND_URL}/user/${token}/config/${id}`
            const requestOptions = {
                method: 'GET'
            };
            var response = await fetch(fetchString, requestOptions);
            var data = await response.json();
            if (!data.valid) {
                return data;
            }

            var config = plainToClass(Configuration, data.response);
            if (config.roomCategories) {
                for (var i = 0; i < config.roomCategories.objects.length; i++) {
                    config.roomCategories.objects[i] = plainToClass(RoomCategory, config.roomCategories.objects[i])
                }
            }
            if (config.corridorCategories) {
                for (var i = 0; i < config.corridorCategories.objects.length; i++) {
                    config.corridorCategories.objects[i] = plainToClass(CorridorCategory, config.corridorCategories.objects[i])
                }
            }
            return { valid: true, "response": config };
        } catch (error) {
            console.log(error);
        }
    }

    // REQ-28: Save.RoomCategory - The system should allow the user to save a Room Category that they have created in the database.
    static async getAllRoomCat() {
        try {
            var token = await Authenticator.getIDToken();
            var fetchString = token ? `${BACKEND_URL}/user/${token}/room` : `${BACKEND_URL}/room`

            const requestOptions = {
                method: 'GET'
            };
            var response = await fetch(fetchString, requestOptions);
            var data = await response.json();
            if (!data.valid) {
                return data;
            }
            var roomCats: RoomCategory[] = [];
            data.response.forEach((element: Object) => {
                roomCats.push(plainToClass(RoomCategory, element))
            });
            return { valid: true, "response": roomCats };
        } catch (error) {
            console.log(error);
        }
    }

    // REQ-37: Save.CorridorCategory - The system should allow the user to save a Corridor Category that they have created in the database.
    static async getAllCorridorCat() {
        try {
            var token = await Authenticator.getIDToken();
            var fetchString = token ? `${BACKEND_URL}/user/${token}/corridor` : `${BACKEND_URL}/corridor`

            const requestOptions = {
                method: 'GET'
            };
            var response = await fetch(fetchString, requestOptions);
            var data = await response.json();
            if (!data.valid) {
                return data;
            }
            var corridorCats: CorridorCategory[] = [];
            data.response.forEach((element: Object) => {
                corridorCats.push(plainToClass(CorridorCategory, element))
            });
            return { valid: true, "response": corridorCats };
        } catch (error) {
            console.log(error);
        }
    }

    // REQ-10: Add.Monster - The systems shall allow a logged in user to fill out and submit a form to add a new monster to the database.
    static async saveMonster(monster: Monster) {
        try {
            var token = await Authenticator.getIDToken();
            if (token === undefined) {
                return { "valid": false, "response": "Not logged in" };
            }
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(monster)
            };
            var response = await fetch(`${BACKEND_URL}/user/${token}/monster`, requestOptions);
            var data = await response.json();
            return data
        } catch (error) {
            console.log(error);
        }
    }

    // REQ-11: Import.Monsters
    static async saveMonsters(monsters: Monster[]) {
        try {
            var token = await Authenticator.getIDToken();
            if (token === undefined) {
                return { "valid": false, "response": "Not logged in" };
            }
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(monsters)
            };
            var response = await fetch(`${BACKEND_URL}/user/${token}/monsters`, requestOptions);
            var data = await response.json();
            console.log(data)
            return data
        } catch (error) {
            console.log(error);
        }
    }

    static async saveItem(item: Item) {
        try {
            var token = await Authenticator.getIDToken();
            if (token === undefined) {
                return { "valid": false, "response": "Not logged in" };
            }
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            };
            var response = await fetch(`${BACKEND_URL}/user/${token}/item`, requestOptions);
            var data = await response.json();
            return data
        } catch (error) {
            console.log(error);
        }
    }

    static async saveTrap(trap: Trap) {
        try {
            var token = await Authenticator.getIDToken();
            if (token === undefined) {
                return { "valid": false, "response": "Not logged in" };
            }
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(trap)
            };
            var response = await fetch(`${BACKEND_URL}/user/${token}/trap`, requestOptions);
            var data = await response.json();
            return data
        } catch (error) {
            console.log(error);
        }
    }

    // REQ-10: Add.Monster - The systems shall allow a logged in user to fill out and submit a form to add a new monster to the database.
    static async getAllMonsters() {
        try {
            var token = await Authenticator.getIDToken();
            var fetchString = token ? `${BACKEND_URL}/user/${token}/monster` : `${BACKEND_URL}/monster`

            const requestOptions = {
                method: 'GET'
            };
            var response = await fetch(fetchString, requestOptions);
            var data = await response.json();
            if (!data.valid) {
                return data;
            }
            var monsters: Monster[] = [];
            data.response.forEach((element: Object) => {
                monsters.push(plainToClass(Monster, element))
            });
            return { valid: true, "response": monsters };
        } catch (error) {
            console.log(error);
        }
    }

    static async getAllItems() {
        try {
            var token = await Authenticator.getIDToken();
            var fetchString = token ? `${BACKEND_URL}/user/${token}/item` : `${BACKEND_URL}/item`

            const requestOptions = {
                method: 'GET'
            };
            var response = await fetch(fetchString, requestOptions);
            var data = await response.json();
            if (!data.valid) {
                return data;
            }
            var items: Item[] = [];
            data.response.forEach((element: Object) => {
                items.push(plainToClass(Item, element))
            });
            return { valid: true, "response": items };
        } catch (error) {
            console.log(error);
        }
    }

    static async getAllTraps() {
        try {
            var token = await Authenticator.getIDToken();
            var fetchString = token ? `${BACKEND_URL}/user/${token}/trap` : `${BACKEND_URL}/trap`

            const requestOptions = {
                method: 'GET'
            };
            var response = await fetch(fetchString, requestOptions);
            var data = await response.json();
            if (!data.valid) {
                return data;
            }
            var traps: Trap[] = [];
            data.response.forEach((element: Object) => {
                traps.push(plainToClass(Trap, element))
            });
            return { valid: true, "response": traps };
        } catch (error) {
            console.log(error);
        }
    }

    static async getAllTileSets() {
        try {
            var tokens = await Authenticator.getAllTokens();
            if (!tokens || !tokens.accessToken || !tokens.refreshToken || !tokens.idToken) {
                return { valid: false, "response": "Not Logged In" };
            }
            const requestOptions = {
                method: 'GET'
            };
            var response = await fetch(`${BACKEND_URL}/user/${tokens.idToken}/tileset?access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`, requestOptions);
            var data = await response.text();
            // var data = await response.json();
            // if (!data.valid) {
            //     return data;
            // }
            // var tileSets: TileSet[] = [];
            // data.response.forEach((element: Object) => {
            //     tileSets.push(plainToClass(TileSet, element))
            // });
            return { valid: true, "response": data };
        } catch (error) {
            console.log(error);
        }
    }

    // REQ-8: Upload.Tiles
    static async saveTileSets(name: string, files: File[], tileTypes: TileType[]) {
        try {
            var tokens = await Authenticator.getAllTokens();
            if (!tokens || !tokens.accessToken || !tokens.refreshToken || !tokens.idToken) {
                return { valid: false, "response": "Not Logged In" };
            }
            var formData = new FormData();
            formData.append('name', name);
            files.forEach((file, index) => {
                var splitName = file.name.split(".");
                var newName = tileTypes[index] + "." + splitName[splitName.length - 1]
                formData.append('images', file, newName)
            });
            const requestOptions = {
                method: 'POST',
                body: formData
            };
            var response = await fetch(`${BACKEND_URL}/user/${tokens.idToken}/tileset?access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`, requestOptions);
            var data = await response.json();
            if (!data.valid) {
                return data;
            }
            console.log(data.response)
            return { valid: true, "response": data };
        } catch (error) {
            console.log(error);
        }
    }
}

if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseKey);
}

export default DB;