/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("kosk4o7fhroattb")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "owkhrlbf",
    "name": "originalName",
    "type": "text",
    "required": false,
    "presentable": false,
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
    "id": "jeetbhy1",
    "name": "size",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ujya4rvm",
    "name": "contentType",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("kosk4o7fhroattb")

  // remove
  collection.schema.removeField("owkhrlbf")

  // remove
  collection.schema.removeField("jeetbhy1")

  // remove
  collection.schema.removeField("ujya4rvm")

  return dao.saveCollection(collection)
})
