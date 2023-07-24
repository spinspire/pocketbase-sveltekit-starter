package hooks

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/mail"

	"html/template"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/tools/mailer"
)

var tpls *template.Template

func init() {
	tpls = template.Must(template.ParseGlob("data/email_templates/*"))
}

// set IgnoreEmailVisibilityFlag for the record and it's expanded records (recursively)
func ignoreEmailVisibility(record *models.Record, value bool) {
	record.IgnoreEmailVisibility(value)
	for _, v := range record.Expand() {
		if child, ok := v.(*models.Record); ok {
			// recursively set ...
			ignoreEmailVisibility(child, value)
		}
	}
}

func doEmail(app *pocketbase.PocketBase, action, action_params string, record *models.Record) (err error) {
	// we have to IgnoreEmailVisibility(true) on the main record and all expanded relations in order
	// to include email fields in the exported JSON
	ignoreEmailVisibility(record, true)

	// Export record to JSON and import it back to convert it into map[string]any.
	// Should I use record.PublicExport() instead?
	ba, _ := json.Marshal(record)
	// log.Default().Println(string(ba))
	var _record map[string]any
	json.Unmarshal(ba, &_record)

	// build input data
	data := map[string]any{
		"record": _record,
		"meta":   app.Settings().Meta,
	}

	// populate template expressions within action_params to build params_json
	// example: {"to":"{{ .record.expand.creator.email }}", "subject": "ticket updated - {{ .record.title }}"}
	params_tpl, err := template.New("action_params").Parse(action_params)
	if err != nil {
		return
	}
	var params_json bytes.Buffer
	err = params_tpl.Execute(&params_json, data)
	if err != nil {
		return
	}

	// Unmarshal params_json into params and then inject that into data
	var params map[string]any
	err = json.Unmarshal(params_json.Bytes(), &params)
	if err != nil {
		return
	}
	data["params"] = params

	if _, ok := params["from"]; !ok {
		params["from"] = app.Settings().Meta.SenderName
	}
	if _, ok := params["to"]; !ok {
		return errors.New("action_params must provide 'to' key/value")
	}
	if _, ok := params["subject"]; !ok {
		return errors.New("action_params must provide 'subject' key/value")
	}

	var html bytes.Buffer
	err = tpls.ExecuteTemplate(&html, action, data)
	if err != nil {
		return
	}
	message := mailer.Message{
		From: mail.Address{
			Address: app.Settings().Meta.SenderAddress,
			Name:    params["from"].(string),
		},
		To: []mail.Address{
			{Address: params["to"].(string)},
		},
		Subject: params["subject"].(string),
		HTML:    html.String(),
		// Text:    string(ba),
	}
	return app.NewMailClient().Send(&message)
}
