migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("3fhw2mfr9zrgodj")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "balsaeka",
    "name": "expands",
    "type": "text",
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "emgxgcok",
    "name": "disabled",
    "type": "bool",
    "required": false,
    "unique": false,
    "options": {}
  }))

  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "dkfnslic", // Generate a unique ID
    "name": "tags",
    "type": "text", // Assuming tags will be stored as a comma-separated string
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }));

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("3fhw2mfr9zrgodj")

  // remove
  collection.schema.removeField("balsaeka")

  // remove
  collection.schema.removeField("emgxgcok")


  collection.schema.removeField("dkfnslic")

  return dao.saveCollection(collection)
})
