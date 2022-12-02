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
				"id": "5bba43cis9ctxr2",
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
						"name": "user",
						"type": "relation",
						"required": false,
						"unique": false,
						"options": {
							"maxSelect": 1,
							"collectionId": "_pb_users_auth_",
							"cascadeDelete": false
						}
					}
				],
				"listRule": "",
				"viewRule": "",
				"createRule": "@request.auth.id != null",
				"updateRule": "user = @request.auth.id",
				"deleteRule": null
			}
		]`

		collections := []*models.Collection{}
		if err := json.Unmarshal([]byte(jsonData), &collections); err != nil {
			return err
		}

		return daos.New(db).ImportCollections(collections, false, nil)
	}, func(db dbx.Builder) error {
		// no revert since the configuration on the environment, on which
		// the migration was executed, could have changed via the UI/API
		return nil
	})
}
