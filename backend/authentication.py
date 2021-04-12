from backend import app
from flask import request, jsonify
from firebase_admin import credentials, firestore, auth, initialize_app  # Initialize Flask App
from flask_cors import CORS, cross_origin
from drive import createFolder, findFolder
from util import *


cors = CORS(app, resources={r'/*': {'origins': '*'}})


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
                access_token = requestData['accessToken']
                refresh_token = requestData['refreshToken']
                dmg_folder = findFolder(access_token, refresh_token, "DMG Tilesets")
                if not dmg_folder:
                    createFolder(access_token, refresh_token, "DMG Tilesets", [])
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