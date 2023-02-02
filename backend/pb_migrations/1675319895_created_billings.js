migrate((db) => {
  const collection = new Collection({
    "id": "9e0upomh1qfs22u",
    "created": "2023-02-02 06:38:15.573Z",
    "updated": "2023-02-02 06:38:15.573Z",
    "name": "billings",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "zd7zcrns",
        "name": "user",
        "type": "relation",
        "required": true,
        "unique": true,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": true,
          "maxSelect": 1,
          "displayFields": []
        }
      }
    ],
    "listRule": "@request.auth.id = user.id",
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("9e0upomh1qfs22u");

  return dao.deleteCollection(collection);
})
