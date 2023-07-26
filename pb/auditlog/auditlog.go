package auditlog

import (
	"log"
	"os"
	"strings"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
	"golang.org/x/exp/slices"
)

// collection names to be audit logged
var collections = strings.Split(os.Getenv("AUDITLOG"), ",")

func Register(app *pocketbase.PocketBase) {
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		app.OnRecordAfterCreateRequest().Add(func(e *core.RecordCreateEvent) error {
			return doAudit(app, "insert", e.Record, e.HttpContext)
		})
		app.OnRecordAfterUpdateRequest().Add(func(e *core.RecordUpdateEvent) error {
			return doAudit(app, "update", e.Record, e.HttpContext)
		})
		app.OnRecordAfterDeleteRequest().Add(func(e *core.RecordDeleteEvent) error {
			return doAudit(app, "delete", e.Record, e.HttpContext)
		})
		return nil
	})
}

func diff(val1, val2 any) bool {
	// handle comparison of non-comparable types
	// TODO: add more cases to the switch below as we discover them
	switch v1 := val1.(type) {
	case []string:
		v2 := val2.([]string)
		if len(v1) != len(v2) {
			return true
		}
		for i, v1 := range v1 {
			if diff(v1, v2[i]) {
				return true
			}
		}
		// no diff, if reached the end of the loop
		return false
	default:
		// use builtin comparison by default
		return val1 != val2
	}
}

func doAudit(app *pocketbase.PocketBase, event string, record *models.Record, ctx echo.Context) error {
	collection := record.Collection().Name
	// exclude logging "auditlog" and include only what's in AUDITLOG env var
	if collection != "auditlog" && slices.Contains(collections, collection) {
		var user, admin string
		if u, ok := ctx.Get(apis.ContextAdminKey).(*models.Admin); ok {
			admin = u.Id
		}
		if u, ok := ctx.Get(apis.ContextAuthRecordKey).(*models.Record); ok {
			user = u.Id
		}
		log.Printf("AuditLog:%s:%s:%s:%s:%s\n", collection, record.Id, event, user, admin)
		target, err := app.Dao().FindCollectionByNameOrId("auditlog")
		if err != nil {
			return err
		}
		auditlog := models.NewRecord(target)
		auditlog.Set("collection", collection)
		auditlog.Set("record", record.Id)
		auditlog.Set("event", event)
		auditlog.Set("user", user)
		auditlog.Set("admin", admin)
		// detect changes
		original := record.OriginalCopy().PublicExport()
		recordExport := record.PublicExport()
		for k, v := range original {
			if !diff(v, recordExport[k]) { // unmodified, then remove
				delete(original, k)
			}
		}
		auditlog.Set("data", recordExport)
		auditlog.Set("original", original)

		return app.Dao().SaveRecord(auditlog)
	}
	return nil
}
