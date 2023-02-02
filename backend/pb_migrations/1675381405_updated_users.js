migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("_pb_users_auth_")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "pnje3fxl",
    "name": "apikey",
    "type": "text",
    "required": false,
    "unique": false,
    "options": {
      "min": 64,
      "max": 64,
      "pattern": "^[a-zA-Z0-9]*$"
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("_pb_users_auth_")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "pnje3fxl",
    "name": "apikey",
    "type": "text",
    "required": false,
    "unique": true,
    "options": {
      "min": 64,
      "max": 64,
      "pattern": "^[a-zA-Z0-9]*$"
    }
  }))

  return dao.saveCollection(collection)
})
