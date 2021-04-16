from flask import Blueprint, Flask, current_app, jsonify, request
from firebase_admin import credentials, firestore, auth, initialize_app  # Initialize Flask App
from .drive import createFolder, findFolder
from .util import *

authentication = Blueprint("authentication", __name__)

# REQ-1: Request.Registration
def registerAccount(user_id, requestData):
    users_collection.document(user_id).set({"temp": True})
    access_token = requestData['accessToken']
    refresh_token = requestData['refreshToken']
    dmg_folder = findFolder(access_token, refresh_token, "DMG Tilesets")
    if not dmg_folder:
        createFolder(access_token, refresh_token, "DMG Tilesets", [])

# REQ-1: Request.Registration - The system will allow the user to register a DMG account through a linked Google Account.
@authentication.route("/register", methods=['POST'])
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
                registerAccount(user_id, requestData)
                return jsonify({"valid": True, "response": "Account Created"}), 200
        else:
            return user_id
    except Exception as e:
        return jsonify({"valid": False, "response": "Failed"}), 400

# REQ-2: Request.Login - The system will compare the provided Google Account login with the database to see if there is a matching registered user.
@authentication.route("/login", methods=['POST'])
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
        return jsonify({"valid": False, "response": "Failed"}), 400