/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("biz12vax7f2qt0e")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "f6lhzufs",
    "name": "posts",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "zjgsixnroq5fi9o",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("biz12vax7f2qt0e")

  // remove
  collection.schema.removeField("f6lhzufs")

  return dao.saveCollection(collection)
})
