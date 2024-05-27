/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const snapshot = [
    {
      "id": "6buxxzelqzdugz3",
      "created": "2024-05-14 16:37:45.101Z",
      "updated": "2024-05-14 16:37:45.101Z",
      "name": "auditlog",
      "type": "base",
      "system": false,
      "schema": [
        {
          "system": false,
          "id": "ffcpmf8m",
          "name": "collection",
          "type": "text",
          "required": true,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "pattern": ""
          }
        },
        {
          "system": false,
          "id": "0xqxkmxg",
          "name": "record",
          "type": "text",
          "required": true,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "pattern": ""
          }
        },
        {
          "system": false,
          "id": "1xxszw4d",
          "name": "event",
          "type": "text",
          "required": true,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "pattern": ""
          }
        },
        {
          "system": false,
          "id": "6k9tiq5x",
          "name": "user",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "fgxgjemm",
          "name": "admin",
          "type": "text",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "pattern": ""
          }
        },
        {
          "system": false,
          "id": "ij8bskyf",
          "name": "data",
          "type": "json",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "maxSize": 5242880
          }
        },
        {
          "system": false,
          "id": "v2h19a45",
          "name": "original",
          "type": "json",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "maxSize": 5242880
          }
        }
      ],
      "indexes": [],
      "listRule": "",
      "viewRule": "",
      "createRule": null,
      "updateRule": null,
      "deleteRule": null,
      "options": {}
    },
    {
      "id": "5bba43cis9ctxr2",
      "created": "2024-05-14 18:39:07.726Z",
      "updated": "2024-05-14 18:39:07.726Z",
      "name": "posts",
      "type": "base",
      "system": false,
      "schema": [
        {
          "system": false,
          "id": "p4ahsysc",
          "name": "title",
          "type": "text",
          "required": true,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "pattern": ""
          }
        },
        {
          "system": false,
          "id": "udhmrtrn",
          "name": "body",
          "type": "text",
          "required": true,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "pattern": ""
          }
        },
        {
          "system": false,
          "id": "itmmirru",
          "name": "slug",
          "type": "text",
          "required": true,
          "presentable": false,
          "unique": true,
          "options": {
            "min": null,
            "max": null,
            "pattern": "[0-9a-z-]+"
          }
        },
        {
          "system": false,
          "id": "h6hquidm",
          "name": "files",
          "type": "file",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "mimeTypes": [],
            "thumbs": [
              "600x0"
            ],
            "maxSelect": 99,
            "maxSize": 5242880,
            "protected": false
          }
        },
        {
          "system": false,
          "id": "sa3zktz1",
          "name": "user",
          "type": "relation",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        }
      ],
      "indexes": [
        "CREATE UNIQUE INDEX \"idx_unique_itmmirru\" on \"posts\" (\"slug\")"
      ],
      "listRule": "",
      "viewRule": "",
      "createRule": "@request.auth.id != null",
      "updateRule": "user = @request.auth.id",
      "deleteRule": "user = @request.auth.id",
      "options": {}
    },
    {
      "id": "_pb_users_auth_",
      "created": "2024-05-22 18:42:22.090Z",
      "updated": "2024-05-22 18:42:22.093Z",
      "name": "users",
      "type": "auth",
      "system": false,
      "schema": [
        {
          "system": false,
          "id": "users_name",
          "name": "name",
          "type": "text",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "pattern": ""
          }
        },
        {
          "system": false,
          "id": "users_avatar",
          "name": "avatar",
          "type": "file",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "mimeTypes": [
              "image/jpeg",
              "image/png",
              "image/svg+xml",
              "image/gif",
              "image/webp"
            ],
            "thumbs": null,
            "maxSelect": 1,
            "maxSize": 5242880,
            "protected": false
          }
        }
      ],
      "indexes": [],
      "listRule": "id = @request.auth.id",
      "viewRule": "id = @request.auth.id",
      "createRule": "",
      "updateRule": "id = @request.auth.id",
      "deleteRule": "id = @request.auth.id",
      "options": {
        "allowEmailAuth": true,
        "allowOAuth2Auth": true,
        "allowUsernameAuth": true,
        "exceptEmailDomains": null,
        "manageRule": null,
        "minPasswordLength": 8,
        "onlyEmailDomains": null,
        "onlyVerified": false,
        "requireEmail": false
      }
    }
  ];

  const collections = snapshot.map((item) => new Collection(item));

  return Dao(db).importCollections(collections, true, null);
}, (db) => {
  return null;
})
