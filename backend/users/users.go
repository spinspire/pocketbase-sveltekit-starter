package users

import (
	"fmt"
	"net/http"
	"pocketbase/util"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

var apiKeyLength = 64

// AutoCreateApiKeyFn Generates a random api key and injects it into Record
func AutoCreateApiKeyFn(event *core.RecordCreateEvent) error {
	apiKey := event.Record.SchemaData()["apikey"]
	if len(apiKey.(string)) <= apiKeyLength {
		event.Record.Set("apikey", util.RandomString(apiKeyLength))
	}
	return nil
}

// Regens the API key and updates the DB
func RegenApiKey(app *pocketbase.PocketBase, ctx echo.Context) error {
	dao := app.Dao()
	id := apis.RequestData(ctx).AuthRecord.Id

	user, err := dao.FindRecordById("users", id)

	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, err)
	}

	fmt.Println("RegenApiKey: User: ", user)
	return nil
}
