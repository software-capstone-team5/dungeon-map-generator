# REQ-1: Request.Registration - The system will allow the user to register a DMG account through a linked Google Account.
# REQ-2: Request.Login - The system will compare the provided Google Account login with the database to see if there is a matching registered user.
from backend import app
from flask import request, jsonify
from firebase_admin import credentials, firestore, initialize_app  # Initialize Flask App
cred = credentials.Certificate('C:\\Users\\Jacob\\Documents\\GitHub\\dungeon-map-generator\\key.json') # change later to either environment var or something else
default_app = initialize_app(cred)
db = firestore.client()
users_collection = db.collection('Users')

@app.route('/registerUser', methods=['GET', 'POST']) # change method depending on how send data
def create():
    try:
        # id = request.json['id']
        id = request.args.get('id')
        # users_collection.document(id).set(request.json)
        users_collection.document(id).set({"temp": True})
        return jsonify({"success": True}), 200
    except Exception as e:
        return f"An Error Occured: {e}"

@app.route('/getUser', methods=['GET'])
def read():
    try:
        # Check if ID was passed to URL query
        user_id = request.args.get('id')
        if user_id:
            user = users_collection.document(user_id).get()
            # Check if User Exists
            if user.exists:
                return jsonify(user.to_dict()), 200
            else:
                return "User does not exist"
        else:
            return "No ID provided"
    except Exception as e:
        return f"An Error Occured: {e}"
