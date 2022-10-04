package migrations

import (
	"encoding/json"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/models"
)

// Auto generated migration with the most recent collections configuration.
func init() {
	m.Register(func(db dbx.Builder) error {
		jsonData := `[
			{
				"id": "systemprofiles0",
				"created": "2022-09-17 00:51:14.917",
				"updated": "2022-10-03 21:50:44.237",
				"name": "profiles",
				"system": true,
				"schema": [
					{
						"system": true,
						"id": "pbfielduser",
						"name": "userId",
						"type": "user",
						"required": true,
						"unique": true,
						"options": {
							"maxSelect": 1,
							"cascadeDelete": true
						}
					},
					{
						"system": false,
						"id": "pbfieldname",
						"name": "name",
						"type": "text",
						"required": false,
						"unique": false,
						"options": {
							"min": null,
							"max": null,
							"pattern": ""
						}
					},
					{
						"system": false,
						"id": "pbfieldavatar",
						"name": "avatar",
						"type": "file",
						"required": false,
						"unique": false,
						"options": {
							"maxSelect": 1,
							"maxSize": 5242880,
							"mimeTypes": [
								"image/jpg",
								"image/jpeg",
								"image/png",
								"image/svg+xml",
								"image/gif"
							],
							"thumbs": null
						}
					}
				],
				"listRule": "userId = @request.user.id",
				"viewRule": "userId = @request.user.id",
				"createRule": "userId = @request.user.id",
				"updateRule": "userId = @request.user.id",
				"deleteRule": null
			},
			{
				"id": "5bba43cis9ctxr2",
				"created": "2022-09-17 00:52:41.368",
				"updated": "2022-10-03 21:50:44.238",
				"name": "posts",
				"system": false,
				"schema": [
					{
						"system": false,
						"id": "p4ahsysc",
						"name": "title",
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
						"id": "udhmrtrn",
						"name": "body",
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
						"id": "itmmirru",
						"name": "slug",
						"type": "text",
						"required": true,
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
						"unique": false,
						"options": {
							"maxSelect": 99,
							"maxSize": 5242880,
							"mimeTypes": [],
							"thumbs": [
								"600x0"
							]
						}
					},
					{
						"system": false,
						"id": "sa3zktz1",
						"name": "uid",
						"type": "user",
						"required": false,
						"unique": false,
						"options": {
							"maxSelect": 1,
							"cascadeDelete": false
						}
					}
				],
				"listRule": "",
				"viewRule": "",
				"createRule": "@request.user.id != null",
				"updateRule": "uid = @request.user.id",
				"deleteRule": null
			},
			{
				"id": "3fhw2mfr9zrgodj",
				"created": "2022-10-03 21:50:44.238",
				"updated": "2022-10-04 04:24:28.113",
				"name": "hooks",
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
				"deleteRule": null
			}
		]`

		collections := []*models.Collection{}
		if err := json.Unmarshal([]byte(jsonData), &collections); err != nil {
			return err
		}

		return daos.New(db).ImportCollections(collections, true, nil)
	}, func(db dbx.Builder) error {
		// no revert since the configuration on the environment, on which
		// the migration was executed, could have changed via the UI/API
		return nil
	})
}
