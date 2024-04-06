/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("oj1dzilhs1honp6")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "8wumqb4x",
    "name": "slug",
    "type": "text",
    "required": true,
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
  const collection = dao.findCollectionByNameOrId("oj1dzilhs1honp6")

  // remove
  collection.schema.removeField("8wumqb4x")

  return dao.saveCollection(collection)
})
