package hooks

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strings"

	"github.com/go-resty/resty/v2"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
)

func PocketBaseInit(app *pocketbase.PocketBase) error {
	modelHandler := func(event string) func(e *core.ModelEvent) error {
		return func(e *core.ModelEvent) error {
			table := e.Model.TableName()
			// we don't want to executeEventActions if the event is a system event (e.g. "_collections" changes)
			if record, ok := e.Model.(*models.Record); ok {
				if table == "hooks" {
					log.Println("'hooks' collection changed. Unloading.")
					hookRowsMap = nil // just set it to nil and it will get re-loaded the next time it is needed
				} else {
					executeEventActions(app, event, table, record)
				}
			} else {
				log.Println("Skipping executeEventActions for table:", table)
			}
			return nil
		}
	}
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		// watch insert/update/delete of rows of all collections
		app.OnModelAfterCreate().Add(modelHandler("insert"))
		app.OnModelAfterUpdate().Add(modelHandler("update"))
		app.OnModelAfterDelete().Add(modelHandler("delete"))
		return nil
	})
	return nil
}

// cache of "hooks" table rows (all where disabled=false)
// key=collection:event, value=array-of-rows
var hookRowsMap map[string][]dbx.NullStringMap

func loadHookRows(db *dbx.DB) {
	if hookRowsMap != nil {
		return // already loaded
	}
	hookRowsMap = make(map[string][]dbx.NullStringMap)
	var rows []dbx.NullStringMap
	db.Select("*").
		From("hooks").
		Where(dbx.HashExp{"disabled": false}). // pick rows not disabled only
		All(&rows)
	for _, row := range rows {
		collection := row["collection"].String
		event := row["event"].String
		key := collection + ":" + event
		hookRowsMap[key] = append(hookRowsMap[key], row)
	}
}

func getHookRows(db *dbx.DB, collection, event string) []dbx.NullStringMap {
	loadHookRows(db)
	key := collection + ":" + event
	return hookRowsMap[key]
}

func DoChatGPT(apiKey, prompt string) (string, error) {
	client := resty.New()

	response, err := client.R().
		SetAuthToken(apiKey).
		SetHeader("Content-Type", "application/json").
		SetBody(map[string]interface{}{
			"model":      "gpt-3.5-turbo",
			"messages":   []interface{}{map[string]interface{}{"role": "system", "content": prompt}},
			"max_tokens": 100,
		}).
		Post("https://api.openai.com/v1/chat/completions")

	if err != nil {
		return "", err
	}

	var data map[string]interface{}
	err = json.Unmarshal(response.Body(), &data)
	if err != nil {
		return "", err
	}

	content := data["choices"].([]interface{})[0].(map[string]interface{})["message"].(map[string]interface{})["content"].(string)
	return content, nil
}

// DoDalle3 generates an image based on the prompt and returns a base64 encoded string.
func DoDalle3(apiKey, prompt, model, size string) (string, error) {
	client := resty.New()

	response, err := client.R().
		SetAuthToken(apiKey).
		SetHeader("Content-Type", "application/json").
		SetBody(map[string]interface{}{
			"model":           model,
			"n":               1,
			"prompt":          prompt,
			"size":            size,
			"response_format": "b64_json",
		}).
		Post("https://api.openai.com/v1/images/generations")

	if err != nil {
		return "", err
	}

	if response.StatusCode() != http.StatusOK {
		return "", fmt.Errorf("unexpected status code: %d, body: %s", response.StatusCode(), response.String())
	}

	// Log the response for debugging purposes
	/* logFile, err := os.OpenFile("api_responses.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatal(err)
	}
	defer logFile.Close()
	log.SetOutput(logFile)
	log.Println("response", response.String()) */

	var respBody struct {
		Created int64                    `json:"created"`
		Data    []map[string]interface{} `json:"data"`
	}
	err = json.Unmarshal(response.Body(), &respBody)
	if err != nil {
		return "", err
	}

	if len(respBody.Data) == 0 {
		return "", fmt.Errorf("response data array is empty")
	}
	
	b64Data, ok := respBody.Data[0]["b64_json"].(string)
	if !ok {
		return "", fmt.Errorf("base64 image data not found in response")
	}

	// Here, instead of writing the data to a file, we return the base64 string
	return b64Data, nil
}

func executeEventActions(app *pocketbase.PocketBase, event string, table string, record *models.Record) {
	rows := getHookRows(app.DB(), table, event)
	for _, row := range rows {
		action_type := row["action_type"].String
		action := row["action"].String
		action_params := row["action_params"].String
		expands := strings.Split(row["expands"].String, ",")
		app.Dao().ExpandRecord(record, expands, func(c *models.Collection, ids []string) ([]*models.Record, error) {
			return app.Dao().FindRecordsByIds(c.Name, ids, nil)
		})
		if err := executeEventAction(app, event, table, action_type, action, action_params, record); err != nil {
			log.Println("ERROR", err)
		}
	}
}

func executeEventAction(app *pocketbase.PocketBase, event, table, action_type, action, action_params string, record *models.Record) error {
	log.Printf("event:%s, table: %s, action: %s\n", event, table, action)
	switch action_type {
	case "command":
		return doCommand(action, action_params, record)
	case "post":
		return doPost(action, action_params, record)
	case "email":
		return doEmail(app, action, action_params, record)
	default:
		return fmt.Errorf("unknown action_type: %s", action_type)
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

// This function would go in a new or existing file where you manage database interactions.
func processTagsForPost(db *pocketbase.PocketBase, postID string, tagsStr string) error {
	// Split the tags string by comma
	tags := strings.Split(tagsStr, ",")
	uniqueTags := make(map[string]bool)
	for _, tag := range tags {
			// Trim spaces and ensure tag is lowercase for consistency
			cleanTag := strings.ToLower(strings.TrimSpace(tag))
			if cleanTag != "" {
					uniqueTags[cleanTag] = true
			}
	}

	// Here you would interact with your database to find existing tags,
	// create new ones if necessary, and link them to the post via the taggings table.
	// The specifics of these operations depend on how you've set up your models
	// and how you interact with PocketBase collections.

	return nil // Implement error handling based on your logic
}
