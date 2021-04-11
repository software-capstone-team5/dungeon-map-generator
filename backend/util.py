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

def getConfigReferences(references):
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