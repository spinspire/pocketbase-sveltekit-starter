package auditlog

import (
	"log"
	"os"
	"strings"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"golang.org/x/exp/slices"
)

// collection names to be audit logged
var collections = strings.Split(os.Getenv("AUDITLOG"), ",")

func Register(app *pocketbase.PocketBase) {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		app.OnRecordCreateRequest().BindFunc(func(e *core.RecordRequestEvent) error {
			if err := e.Next(); err != nil {
				return err
			}
			return doAudit(app, "insert", e)
		})
		app.OnRecordUpdateRequest().BindFunc(func(e *core.RecordRequestEvent) error {
			if err := e.Next(); err != nil {
				return err
			}
			return doAudit(app, "update", e)
		})
		app.OnRecordDeleteRequest().BindFunc(func(e *core.RecordRequestEvent) error {
			if err := e.Next(); err != nil {
				return err
			}
			return doAudit(app, "delete", e)
		})
		return se.Next()
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
	case []interface{}:
		return false
	default:
		// use builtin comparison by default
		return val1 != val2
	}
}

func doAudit(app *pocketbase.PocketBase, event string, request *core.RecordRequestEvent) error {
	record := request.Record
	auth := request.Auth
	collection := record.Collection().Name
	// exclude logging "auditlog" and include only what's in AUDITLOG env var
	if collection != "auditlog" && slices.Contains(collections, collection) {
		var user, admin string
		if auth.IsSuperuser() {
			admin = auth.Id
		} else {
			user = auth.Id
		}
		log.Printf("AuditLog:%s:%s:%s:%s:%s\n", collection, record.Id, event, user, admin)
		target, err := app.FindCollectionByNameOrId("auditlog")
		if err != nil {
			return err
		}
		auditlog := core.NewRecord(target)
		auditlog.Set("collection", collection)
		auditlog.Set("record", record.Id)
		auditlog.Set("event", event)
		auditlog.Set("user", user)
		auditlog.Set("admin", admin)
		// detect changes
		original := record.Original().PublicExport()
		recordExport := record.PublicExport()
		for k, v := range original {
			if !diff(v, recordExport[k]) { // unmodified, then remove
				delete(original, k)
			}
		}
		auditlog.Set("data", recordExport)
		auditlog.Set("original", original)

		return app.Save(auditlog)
	}
	return nil
}
