from backend import app
from flask import request, jsonify
from firebase_admin import credentials, firestore, auth, initialize_app  # Initialize Flask App
from flask_cors import CORS, cross_origin
from google.oauth2 import id_token
from google.auth.transport import requests
from util import *

cred = credentials.Certificate('./certs/key.json') # change later to either environment var or something else
default_app = initialize_app(cred)
db = firestore.client()
users_collection = db.collection('Users')

cors = CORS(app, resources={r'/*': {'origins': '*'}})

def verifyToken(idToken):
    try:
        decoded_token = auth.verify_id_token(idToken, check_revoked=True)
        return decoded_token['uid']
    except auth.RevokedIdTokenError:
        return jsonify({"valid": False, "response": "Revoked ID"}), 400
    except auth.InvalidIdTokenError:
        return jsonify({"valid": False, "response": "Invalid ID"}), 400

# REQ-1: Request.Registration - The system will allow the user to register a DMG account through a linked Google Account.
@app.route("/register", methods=['POST'])
def register():
    try:
        requestData = request.get_json()
        user_id = verifyToken(requestData['idToken'])
        if type(user_id) == str:
            user = users_collection.document(user_id).get()
            # Check if User Exists
            if user.exists:
                return jsonify({"valid": False, "response": "Account Already Exists"}), 400
            else:
                users_collection.document(user_id).set({"temp": True})
                return jsonify({"valid": True, "response": "Account Created"}), 200
        else:
            return user_id
    except Exception as e:
        return f"An Error Occured: {e}"

# REQ-2: Request.Login - The system will compare the provided Google Account login with the database to see if there is a matching registered user.
@app.route("/login", methods=['POST'])
def login():
    try:
        requestData = request.get_json()
        user_id = verifyToken(requestData['idToken'])
        if type(user_id) == str:
            user = users_collection.document(user_id).get()
            # Check if User Exists
            if user.exists:
                return jsonify({"valid": True, "response": "Successful Login"}), 200
            else:
                return jsonify({"valid": False, "response": "User does not exist"}), 400
        else:
            return user_id
    except Exception as e:
        return f"An Error Occured: {e}"

# REQ-18: Save.MapConfiguration - The system allows logged-in users to save the entire map configuration (both Map Level and Region Level) as a Preset.
@app.route("/user/<idToken>/config", methods=['POST'])
def saveConfig(idToken):
    try:
        requestData = request.get_json()
        user_id = verifyToken(idToken)
        if type(user_id) == str:
            config_collection = users_collection.document(user_id).collection("Configurations")
            requestData, config = getDBID(requestData, config_collection)

            # Save corridor category references in CorridorCategories collection in DB
            corridorCategories = requestData['corridorCategories']
            corridorCat_collection = users_collection.document(user_id).collection("CorridorCategories")
            # Update configuration to hold DB references
            requestData['corridorCategories']['objects'] = saveReferences(corridorCategories, corridorCat_collection)

            # Save room category references in RoomCategories collection in DB
            roomCategories = requestData['roomCategories']
            roomCat_collection = users_collection.document(user_id).collection("RoomCategories")
            # Update configuration to hold DB references
            requestData['roomCategories']['objects'] = saveReferences(roomCategories, roomCat_collection)

            config.set(requestData) # TODO remove episilon including child nodes that have them
            return jsonify({"valid": True, "response": config.id}), 200
        else:
            return user_id
    except Exception as e:
        return f"An Error Occured: {e}"

# REQ-28: Save.RoomCategory - The system should allow the user to save a Room Category that they have created in the database.
@app.route("/user/<idToken>/room", methods=['POST'])
def saveRoomCategory(idToken):
    try:
        requestData = request.get_json()
        user_id = verifyToken(idToken)
        if type(user_id) == str:
            # Save room category in RoomCategories collection in DB
            roomCat_collection = users_collection.document(user_id).collection("RoomCategories")
            category = saveCategory(requestData, roomCat_collection, users_collection, user_id)
            return jsonify({"valid": True, "response": category.id}), 200
        else:
            return user_id
    except Exception as e:
        return f"An Error Occured: {e}"

# REQ-37: Save.CorridorCategory - The system should allow the user to save a Corridor Category that they have created in the database.
@app.route("/user/<idToken>/corridor", methods=['POST'])
def saveCorridorCategory(idToken):
    try:
        requestData = request.get_json()
        user_id = verifyToken(idToken)
        if type(user_id) == str:
            # Save corridor category in CorridorCategories collection in DB
            corridorCat_collection = users_collection.document(user_id).collection("CorridorCategories")
            category = saveCategory(requestData, corridorCat_collection, users_collection, user_id)
            return jsonify({"valid": True, "response": category.id}), 200
        else:
            return user_id
    except Exception as e:
        return f"An Error Occured: {e}"


# REQ-18: Save.MapConfiguration - The system allows logged-in users to save the entire map configuration (both Map Level and Region Level) as a Preset.
@app.route("/user/<idToken>/config", methods=['GET'])
def getConfigs(idToken):
    try:
        user_id = verifyToken(idToken)
        if user_id:
            configs = users_collection.document(user_id).collection("Configurations")
            result = []
            for config in configs.stream():
                configDict = config.to_dict()
                corridorRefs = configDict['corridorCategories']['objects']
                configDict['corridorCategories']['objects'] = getReferences(corridorRefs)

                roomRefs = configDict['roomCategories']['objects']
                configDict['roomCategories']['objects'] = getReferences(roomRefs)
                result.append(configDict)
            return jsonify({"valid": True, "response": result}), 200
        else:
            return jsonify({"valid": False, "response": "No ID provided"}), 400
    except Exception as e:
        return f"An Error Occured: {e}"

# REQ-28: Save.RoomCategory - The system should allow the user to save a Room Category that they have created in the database.
@app.route("/user/<idToken>/room", methods=['GET'])
def getRooms(idToken):
    try:
        user_id = verifyToken(idToken)
        if user_id:
            rooms = users_collection.document(user_id).collection("RoomCategories")
            result = []
            for room in rooms.stream():
                roomDict = room.to_dict()
                # roomCategory = getCategoryReferences(roomDict)
                result.append(roomDict) # TODO Replace with roomCategory
            return jsonify({"valid": True, "response": result}), 200
        else:
            return jsonify({"valid": False, "response": "No ID provided"}), 400
    except Exception as e:
        return f"An Error Occured: {e}"

# REQ-37: Save.CorridorCategory - The system should allow the user to save a Corridor Category that they have created in the database.
@app.route("/user/<idToken>/corridor", methods=['GET'])
def getCorridors(idToken):
    try:
        user_id = verifyToken(idToken)
        if user_id:
            corridors = users_collection.document(user_id).collection("CorridorCategories")
            result = []
            for corridor in corridors.stream():
                corridorDict = corridor.to_dict()
                # corridorCategory = getCategoryReferences(corridorDict)
                result.append(corridorDict) # TODO Replace with corridorCategory
            return jsonify({"valid": True, "response": result}), 200
        else:
            return jsonify({"valid": False, "response": "No ID provided"}), 400
    except Exception as e:
        return f"An Error Occured: {e}"