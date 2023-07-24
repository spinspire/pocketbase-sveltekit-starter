migrate((db) => {
  const collection = new Collection({
    "id": "3fhw2mfr9zrgodj",
    "created": "2022-12-23 22:30:35.443Z",
    "updated": "2022-12-23 22:30:35.443Z",
    "name": "hooks",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "j8mewfur",
        "name": "collection",
        "type": "text",
        "required": true,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "4xcxcfuv",
        "name": "event",
        "type": "select",
        "required": true,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "insert",
            "update",
            "delete"
          ]
        }
      },
      {
        "system": false,
        "id": "u3bmgjpb",
        "name": "action_type",
        "type": "select",
        "required": true,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "command",
            "email",
            "post"
          ]
        }
      },
      {
        "system": false,
        "id": "kayyu1l3",
        "name": "action",
        "type": "text",
        "required": true,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "zkengev8",
        "name": "action_params",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("3fhw2mfr9zrgodj");

  return dao.deleteCollection(collection);
})

