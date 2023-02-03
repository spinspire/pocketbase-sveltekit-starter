package users

import (
	"pocketbase/util"

	"github.com/pocketbase/pocketbase/core"
)

var ApiKeyLength int = 64

func AutoCreateApiKeyFn(event *core.RecordCreateEvent) error {
	apiKey := event.Record.SchemaData()["apikey"]
	if len(apiKey.(string)) <= ApiKeyLength {
		event.Record.Set("apikey", util.RandomString(ApiKeyLength))
	}
	return nil
}
