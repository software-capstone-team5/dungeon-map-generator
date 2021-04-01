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

# REQ-1: Request.Registration - The system will allow the user to register a DMG account through a linked Google Account.
@app.route("/register", methods=['POST'])
def register():
    try:
        requestData = request.get_json()
        # id_token comes from the client app (shown above)
        try:
            decoded_token = auth.verify_id_token(requestData['idToken'], check_revoked=True)
            user_id = decoded_token['uid']

            if user_id:
                user = users_collection.document(user_id).get()
                # Check if User Exists
                if user.exists:
                    return jsonify({"valid": False, "response": "Account Already Exists"}), 400
                else:
                    users_collection.document(user_id).set({"temp": True})
                    return jsonify({"valid": True, "response": "Account Created"}), 200
            else:
                return jsonify({"valid": False, "response": "No ID provided"}), 400
        except auth.RevokedIdTokenError:
            return jsonify({"valid": False, "response": "Revoked ID"}), 400
        except auth.InvalidIdTokenerror:
            return jsonify({"valid": False, "response": "Invalid ID"}), 400
    except Exception as e:
        return f"An Error Occured: {e}"

# REQ-2: Request.Login - The system will compare the provided Google Account login with the database to see if there is a matching registered user.
@app.route("/login", methods=['POST'])
def login():
    try:
        requestData = request.get_json()
        # id_token comes from the client app (shown above)
        try:
            decoded_token = auth.verify_id_token(requestData['idToken'], check_revoked=True)
            user_id = decoded_token['uid']

            if user_id:
                user = users_collection.document(user_id).get()
                # Check if User Exists
                if user.exists:
                    return jsonify({"valid": True, "response": "Successful Login"}), 200
                else:
                    return jsonify({"valid": False, "response": "User does not exist"}), 400
            else:
                return jsonify({"valid": False, "response": "No ID provided"}), 400
        except auth.RevokedIdTokenError:
            return jsonify({"valid": False, "response": "Revoked ID"}), 400
        except auth.InvalidIdTokenerror:
            return jsonify({"valid": False, "response": "Invalid ID"}), 400
    except Exception as e:
        return f"An Error Occured: {e}"
