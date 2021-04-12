from flask import jsonify
from firebase_admin import credentials, firestore, auth, initialize_app

cred = credentials.Certificate('./certs/key.json') # change later to either environment var or something else
default_app = initialize_app(cred)

db = firestore.client()
users_collection = db.collection('Users')

def saveTileSetDB(user_id, tileset_name):
    tileset_collection = users_collection.document(user_id).collection("Tileset")
    docs = tileset_collection.where('name', '==', tileset_name).get()

    if len(docs) > 0:
        return { "valid": False, "response": "Tileset name already exists"}
    else:
        doc = users_collection.document(user_id).collection("Tileset").document()
        doc_id = doc.id
        doc.set({'id': doc_id, 'name': tileset_name})
        return {"valid": True, "response": doc_id}

def verifyToken(idToken):
    try:
        decoded_token = auth.verify_id_token(idToken, check_revoked=True)
        return decoded_token['uid']
    except auth.RevokedIdTokenError:
        return jsonify({"valid": False, "response": "Revoked ID"}), 400
    except auth.InvalidIdTokenError:
        return jsonify({"valid": False, "response": "Invalid ID"}), 400

def getDBID(data, collection_ref):
    db_id = data['id']
    # ID is not empty
    if db_id:
        document = collection_ref.document(db_id)
        if not document.get().exists:
            document = collection_ref.document()
            data['id'] = document.id
    # New document
    else:
        document = collection_ref.document()
        data['id'] = document.id
    return data, document

def getConfigReferences(config):
    configDict = config.to_dict()
    corridorRefs = configDict['corridorCategories']['objects']
    configDict['corridorCategories']['objects'] = getSubReferences(corridorRefs)

    roomRefs = configDict['roomCategories']['objects']
    configDict['roomCategories']['objects'] = getSubReferences(roomRefs)

    defaultCorridorRef = configDict['defaultCorridorCategory']
    configDict['defaultCorridorCategory'] = getSubReferences([defaultCorridorRef])[0]

    defaultRoomRef = configDict['defaultRoomCategory']
    configDict['defaultRoomCategory'] = getSubReferences([defaultRoomRef])[0]

    return configDict

def getSubReferences(references):
    result = []
    for reference in references:
        category = reference.get().to_dict()
        result.append(getCategoryReferences(category))
    return result

def getCategoryReferences(dbData):
    # Get Monster, Trap, Item ref TODO once merged
    monsterRefs = dbData['monsters']['objects']
    dbData['monsters']['objects'] = getReferences(monsterRefs)

    itemRefs = dbData['items']['objects']
    dbData['items']['objects'] = getReferences(itemRefs)

    trapRefs = dbData['traps']['objects']
    dbData['traps']['objects'] = getReferences(trapRefs)
    return dbData

def getReferences(references):
    result = []
    for reference in references:
        doc = reference.get()
        result.append(doc.to_dict())
    return result

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
def saveCategory(categoryData, collection_ref, users_collection, user_id):
    categoryData, dbCategory = getDBID(categoryData, collection_ref)
    #Also update db for Monster, items, traps TODO
    # Save monster references in Monsters collection in DB
    monsters = categoryData['monsters']
    monster_collection = users_collection.document(user_id).collection("Monsters")
    # Update category to hold DB references
    categoryData['monsters']['objects'] = saveReferences(monsters, monster_collection)

    # Save item references in Items collection in DB
    items = categoryData['items']
    item_collection = users_collection.document(user_id).collection("Items")
    # Update configuration to hold DB references
    categoryData['items']['objects'] = saveReferences(items, item_collection)

    # Save trap references in Traps collection in DB
    traps = categoryData['traps']
    trap_collection = users_collection.document(user_id).collection("Traps")
    # Update configuration to hold DB references
    categoryData['traps']['objects'] = saveReferences(traps, trap_collection)

    dbCategory.set(categoryData) # TODO remove episilon including child nodes that have them
    return dbCategory