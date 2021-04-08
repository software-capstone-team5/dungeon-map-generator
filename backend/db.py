from backend import app
from flask import request, jsonify
from firebase_admin import credentials, firestore, auth, initialize_app  # Initialize Flask App
from flask_cors import CORS, cross_origin
from google.oauth2 import id_token
from google.auth.transport import requests

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
            db_id = requestData['id']
            config_collection = users_collection.document(user_id).collection("Configurations")
            # Document exists in DB
            if db_id:
                config = config_collection.document(db_id)
            # New document
            else:
                config = config_collection.document()
                requestData['id'] = config.id

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
            category = saveCategory(requestData, roomCat_collection)
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
            category = saveCategory(requestData, corridorCat_collection)
            return jsonify({"valid": True, "response": category.id}), 200
        else:
            return user_id
    except Exception as e:
        return f"An Error Occured: {e}"

def saveReferences(data, collection_ref):
    references = []
    for i in range(len(data['objects'])):
        reference = data['objects'][i]
        ref_id = reference['id']
        db_reference = collection_ref.document(ref_id)
        references.append(db_reference)
    return references

# REQ-28: Save.RoomCategory - The system should allow the user to save a Room Category that they have created in the database.
# REQ-37: Save.CorridorCategory - The system should allow the user to save a Corridor Category that they have created in the database.
def saveCategory(categoryData, collection_ref):
    cat_id = categoryData['id']
    if cat_id:
        dbCategory = collection_ref.document(cat_id)
    else:
        dbCategory = collection_ref.document()
        categoryData['id'] = dbCategory.id

    #Also update db for Monster, items, traps,
    dbCategory.set(categoryData) # TODO remove episilon including child nodes that have them
    return dbCategory

#getConfigAll WIP
@app.route("/user/<idToken>/config/<config_id>", methods=['GET'])
def getConfigByName(idToken, config_id):
    try:
        user_id = verifyToken(idToken)
        if user_id:
            config_collection = users_collection.document(user_id).collection("Configurations")
            # Find matching document based on name
            docs = config_collection.where('name', '==', config_id).get()
            if docs:
                for doc in docs:
                    result = config_collection.document(doc.id).get()
                return jsonify({"config": result.to_dict()}), 200
        else:
            return jsonify({"valid": False, "response": "No ID provided"}), 400
    except Exception as e:
        return f"An Error Occured: {e}"
