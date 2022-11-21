package hooks

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
)

func PocketBaseInit(app *pocketbase.PocketBase) error {
	createHandler := func(event string) func(e *core.ModelEvent) error {
		return func(e *core.ModelEvent) error {
			table := e.Model.TableName()
			// we don't want to executeEventActions if the event is a system event (e.g. "_collections" changes)
			if record, ok := e.Model.(*models.Record); ok {
				executeEventActions(app.DB(), event, table, record)
			} else {
				log.Println("Skipping executeEventActions for table:", table)
			}
			return nil
		}
	}
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		app.OnModelAfterCreate().Add(createHandler("insert"))
		app.OnModelAfterUpdate().Add(createHandler("update"))
		app.OnModelAfterDelete().Add(createHandler("delete"))
		return nil
	})
	return nil
}

func executeEventActions(db *dbx.DB, event string, table string, record *models.Record) {
	rows := []dbx.NullStringMap{}
	db.Select("action_type", "action", "action_params").
		From("hooks").
		Where(dbx.HashExp{"collection": table, "event": event}).
		All(&rows)
	for _, row := range rows {
		action_type := row["action_type"].String
		action := row["action"].String
		action_params := row["action_params"].String
		if err := executeEventAction(event, table, action_type, action, action_params, record); err != nil {
			log.Println("ERROR", err)
		}
	}
}

func executeEventAction(event, table, action_type, action, action_params string, record *models.Record) error {
	log.Printf("event:%s, table: %s, action: %s\n", event, table, action)
	switch action_type {
	case "command":
		return doCommand(action, action_params, record)
	case "post":
		return doPost(action, action_params, record)
	default:
		return errors.New(fmt.Sprintf("Unknown action_type: %s", action_type))
	}
}

func doCommand(action, action_params string, record *models.Record) error {
	cmd := exec.Command(action, action_params)
	if w, err := cmd.StdinPipe(); err != nil {
		return err
	} else {
		if r, err := cmd.StdoutPipe(); err != nil {
			return err
		} else {
			go func() {
				defer w.Close()
				defer r.Close()
				log.Println("-------------------------------")
				defer log.Println("-------------------------------")
				if err := cmd.Start(); err != nil {
					log.Printf("command start failed: %s %+v\n", action, err)
				} else {
					// write JSON into the pipe and close
					json.NewEncoder(w).Encode(record)
					w.Close()
					if err := cmd.Wait(); err != nil {
						log.Printf("command wait failed: %s %+v\n", action, err)
					}
				}
			}()
			// read pipe's stdout and copy to ours (in parallel to the above goroutine)
			io.Copy(os.Stdout, r)
		}
	}
	return nil
}

func doPost(action, action_params string, record *models.Record) error {
	r, w := io.Pipe()
	defer w.Close()
	go func() {
		defer r.Close()
		if resp, err := http.Post(action, "application/json", r); err != nil {
			log.Println("POST failed", action, err)
		} else {
			io.Copy(os.Stdout, resp.Body)
		}
	}()
	if err := json.NewEncoder(w).Encode(record); err != nil {
		log.Println("ERROR writing to pipe", err)
	}
	return nil
}
