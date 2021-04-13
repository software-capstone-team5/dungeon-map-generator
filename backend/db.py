from firebase_admin import auth, credentials, firestore  # Initialize Flask App
from flask import jsonify, request
from flask_cors import CORS, cross_origin
from google.auth.transport import requests
from google.oauth2 import id_token

from authentication import verifyToken
from backend import app
from util import *

cors = CORS(app, resources={r'/*': {'origins': '*'}})

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
            premade_corridorCat_collection = users_collection.document(premade_id).collection("CorridorCategories")
            # Update configuration to hold DB references
            requestData['corridorCategories']['objects'] = saveReferences(corridorCategories, corridorCat_collection, premade_corridorCat_collection)

            # Save room category references in RoomCategories collection in DB
            roomCategories = requestData['roomCategories']
            roomCat_collection = users_collection.document(user_id).collection("RoomCategories")
            premade_roomCat_collection = users_collection.document(premade_id).collection("RoomCategories")
            # Update configuration to hold DB references
            requestData['roomCategories']['objects'] = saveReferences(roomCategories, roomCat_collection, premade_roomCat_collection)

             # Save default corridor category references
            defaultCorridorCat = requestData['defaultCorridorCategory']
            requestData['defaultCorridorCategory'] = saveReference(defaultCorridorCat, corridorCat_collection, premade_corridorCat_collection)

            # Save default room category references
            defaultRoomCat = requestData['defaultRoomCategory']
            requestData['defaultRoomCategory'] = saveReference( defaultRoomCat, roomCat_collection, premade_roomCat_collection)

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
@app.route('/config', methods=['GET'])
@app.route("/user/<idToken>/config", methods=['GET'])
def getConfigs(idToken=None):
    try:
        if idToken is None:
            result = []
            configsPremade = users_collection.document(premade_id).collection("Configurations")
            for config in configsPremade.stream():
                configDict = config.to_dict()
                configPartial = {"id": configDict["id"], "name": configDict["name"], "premade": configDict["premade"]}
                result.append(configPartial)
            return jsonify({"valid": True, "response": result}), 200
        user_id = verifyToken(idToken)
        if user_id:
            result = []
            configsPremade = users_collection.document(premade_id).collection("Configurations")
            for config in configsPremade.stream():
                configDict = config.to_dict()
                configPartial = {"id": configDict["id"], "name": configDict["name"], "premade": configDict["premade"]}
                result.append(configPartial)
            configs = users_collection.document(user_id).collection("Configurations")
            for config in configs.stream():
                configDict = config.to_dict()
                configPartial = {"id": configDict["id"], "name": configDict["name"], "premade": configDict["premade"]}
                result.append(configPartial)
            return jsonify({"valid": True, "response": result}), 200
        else:
            return jsonify({"valid": False, "response": "No ID provided"}), 400
    except Exception as e:
        return f"An Error Occured: {e}"

@app.route('/config/<configID>', methods=['GET'])
@app.route("/user/<idToken>/config/<configID>", methods=['GET'])
def getConfigByID(idToken=None, configID=None):
    try:
        if idToken is None:
            config = users_collection.document(premade_id).collection("Configurations").document(configID).get()
            result = getConfigReferences(config)

            return jsonify({"valid": True, "response": result}), 200
        user_id = verifyToken(idToken)
        if user_id:
            config = users_collection.document(user_id).collection("Configurations").document(configID).get()
            result = getConfigReferences(config)

            return jsonify({"valid": True, "response": result}), 200
        else:
            return jsonify({"valid": False, "response": "No ID provided"}), 400
    except Exception as e:
        return f"An Error Occured: {e}"

# REQ-28: Save.RoomCategory - The system should allow the user to save a Room Category that they have created in the database.
@app.route('/room', methods=['GET'])
@app.route("/user/<idToken>/room", methods=['GET'])
def getRooms(idToken=None):
    try:
        if idToken is None:
            result = getPremadeRegions("RoomCategories")
            return jsonify({"valid": True, "response": result}), 200
        user_id = verifyToken(idToken)
        if user_id:
            result = getPremadeRegions("RoomCategories")
            rooms = users_collection.document(user_id).collection("RoomCategories")
            for room in rooms.stream():
                roomDict = room.to_dict()
                roomCategory = getCategoryReferences(roomDict)
                result.append(roomCategory)
            return jsonify({"valid": True, "response": result}), 200
        else:
            return jsonify({"valid": False, "response": "No ID provided"}), 400
    except Exception as e:
        return f"An Error Occured: {e}"

# REQ-37: Save.CorridorCategory - The system should allow the user to save a Corridor Category that they have created in the database.
@app.route('/corridor', methods=['GET'])
@app.route("/user/<idToken>/corridor", methods=['GET'])
def getCorridors(idToken=None):
    try:
        if idToken is None:
            result = getPremades("CorridorCategories")
            return jsonify({"valid": True, "response": result}), 200
        user_id = verifyToken(idToken)
        if user_id:
            result = getPremades("CorridorCategories")
            corridors = users_collection.document(user_id).collection("CorridorCategories")
            for corridor in corridors.stream():
                corridorDict = corridor.to_dict()
                corridorCategory = getCategoryReferences(corridorDict)
                result.append(corridorCategory)
            return jsonify({"valid": True, "response": result}), 200
        else:
            return jsonify({"valid": False, "response": "No ID provided"}), 400
    except Exception as e:
        return f"An Error Occured: {e}"

# REQ-10: Add.Monster - The systems shall allow a logged in user to fill out and submit a form to add a new monster to the database.
@app.route("/user/<idToken>/monster", methods=['POST'])
def saveMonster(idToken):
    try:
        requestData = request.get_json()
        user_id = verifyToken(idToken)
        if type(user_id) == str:
            monster_collection = users_collection.document(user_id).collection("Monsters")
            monsterData, dbMonster = getDBID(requestData, monster_collection)
            dbMonster.set(monsterData)
            return jsonify({"valid": True, "response": dbMonster.id}), 200
        else:
            return user_id
    except Exception as e:
        return f"An Error Occured: {e}"

# REQ-11: Import.Monsters
@app.route("/user/<idToken>/monsters", methods=['POST'])
def saveMonsters(idToken):
    try:
        requestData = request.get_json()
        user_id = verifyToken(idToken)
        if type(user_id) == str:
            monster_collection = users_collection.document(user_id).collection("Monsters")
            monster_ids = []
            for monster in requestData:
                monsterData, dbMonster = getDBID(monster, monster_collection)
                dbMonster.set(monsterData)
                monster_ids.append(dbMonster.id)
            return jsonify({"valid": True, "response": monster_ids}), 200
        else:
            return user_id
    except Exception as e:
        return f"An Error Occured: {e}"


@app.route("/user/<idToken>/item", methods=['POST'])
def saveItem(idToken):
    try:
        requestData = request.get_json()
        user_id = verifyToken(idToken)
        if type(user_id) == str:
            item_collection = users_collection.document(user_id).collection("Items")
            itemData, dbItem = getDBID(requestData, item_collection)
            dbItem.set(itemData)
            return jsonify({"valid": True, "response": dbItem.id}), 200
        else:
            return user_id
    except Exception as e:
        return f"An Error Occured: {e}"

@app.route("/user/<idToken>/trap", methods=['POST'])
def saveTrap(idToken):
    try:
        requestData = request.get_json()
        user_id = verifyToken(idToken)
        if type(user_id) == str:
            trap_collection = users_collection.document(user_id).collection("Traps")
            trapData, dbTrap = getDBID(requestData, trap_collection)
            dbTrap.set(trapData)
            return jsonify({"valid": True, "response": dbTrap.id}), 200
        else:
            return user_id
    except Exception as e:
        return f"An Error Occured: {e}"

# REQ-10: Add.Monster
@app.route('/monster', methods=['GET'])
@app.route("/user/<idToken>/monster", methods=['GET'])
def getMonsters(idToken=None):
    try:
        if idToken is None:
            result = getPremades("Monsters")
            return jsonify({"valid": True, "response": result}), 200
        user_id = verifyToken(idToken)
        if user_id:
            result = getPremades("Monsters")
            monsters = users_collection.document(user_id).collection("Monsters")
            for monster in monsters.stream():
                monsterDict = monster.to_dict()
                result.append(monsterDict)
            return jsonify({"valid": True, "response": result}), 200
        else:
            return jsonify({"valid": False, "response": "No ID provided"}), 400
    except Exception as e:
        return f"An Error Occured: {e}"

@app.route('/item', methods=['GET'])
@app.route("/user/<idToken>/item", methods=['GET'])
def getItems(idToken=None):
    try:
        if idToken is None:
            result = getPremades("Items")
            return jsonify({"valid": True, "response": result}), 200
        user_id = verifyToken(idToken)
        if user_id:
            result = getPremades("Items")
            items = users_collection.document(user_id).collection("Items")
            for item in items.stream():
                itemDict = item.to_dict()
                result.append(itemDict)
            return jsonify({"valid": True, "response": result}), 200
        else:
            return jsonify({"valid": False, "response": "No ID provided"}), 400
    except Exception as e:
        return f"An Error Occured: {e}"

@app.route('/trap', methods=['GET'])
@app.route("/user/<idToken>/trap", methods=['GET'])
def getTraps(idToken=None):
    try:
        if idToken is None:
            result = getPremades("Traps")
            return jsonify({"valid": True, "response": result}), 200
        user_id = verifyToken(idToken)
        if user_id:
            result = getPremades("Traps")
            traps = users_collection.document(user_id).collection("Traps")
            for trap in traps.stream():
                trapDict = trap.to_dict()
                result.append(trapDict)
            return jsonify({"valid": True, "response": result}), 200
        else:
            return jsonify({"valid": False, "response": "No ID provided"}), 400
    except Exception as e:
        return f"An Error Occured: {e}"
    