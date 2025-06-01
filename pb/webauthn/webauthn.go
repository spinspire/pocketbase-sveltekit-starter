package webauthn

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

type WebAuthnUser struct {
	Record *core.Record
	App    *pocketbase.PocketBase
}

func (u *WebAuthnUser) WebAuthnID() []byte {
	return []byte(u.Record.Id)
}

func (u *WebAuthnUser) WebAuthnName() string {
	return u.Record.GetString("username")
}

func (u *WebAuthnUser) WebAuthnDisplayName() string {
	return u.Record.GetString("name")
}

func (u *WebAuthnUser) WebAuthnCredentials() []webauthn.Credential {
	var credentials []webauthn.Credential
	records, err := u.App.FindAllRecords(
		"passkeys",
		dbx.NewExp("user = {:user}", dbx.Params{"user": u.Record.Id}),
	)
	if err != nil || len(records) == 0 {
		return nil
	}

	for _, record := range records {
		creds := record.GetString("credentials")
		credStruct := webauthn.Credential{}
		if err := json.Unmarshal([]byte(creds), &credStruct); err != nil {
			continue
		}
		credentials = append(credentials, credStruct)
	}
	return credentials
}

var (
	err      error
	webAuthn *webauthn.WebAuthn
)

func findAuthRecordByUsernameOrEmail(app *pocketbase.PocketBase, usernameOrEmail string) (*core.Record, error) {
	user, err := app.FindFirstRecordByFilter("users", "username = {:qs} || email = {:qs}", map[string]any{
		"qs": usernameOrEmail,
	})
	return user, err
}

func saveCredentials(app *pocketbase.PocketBase, user *core.Record, creds webauthn.Credential) error {
	credID := base64.StdEncoding.EncodeToString(creds.ID) // Parse the credential ID to a string
	passkeyRecord, err := app.FindFirstRecordByFilter("passkeys", "credential_id = {:id}", map[string]any{
		"id": credID,
	})
	if err != nil { // new passkey
		collection, err := app.FindCollectionByNameOrId("passkeys")
		if err != nil {
			return err
		}
		record := core.NewRecord(collection)
		record.Set("user", user.Id)
		record.Set("credential_id", credID)
		record.Set("credentials", creds)
		err = app.Save(record)
		return err
	} else { // update the passkey
		passkeyRecord.Set("credential_id", credID)
		passkeyRecord.Set("credentials", creds)
		err = app.Save(passkeyRecord)
		return err
	}
}

var responses = map[string]any{
	"failed":      "Failed to authenticate",
	"reg_error":   "Failed to register",
	"login_error": "Failed to login",
	"reg_success": "Successfully registered",
	"cred_error":  "Failed to save credentials",
}

func Register(app *pocketbase.PocketBase) {
	origin := app.Settings().Meta.AppURL
	if origin == "" {
		app.Logger().Error("WebAuthn: AppURL is not set in the config.")
		return
	}
	domain := origin[strings.Index(origin, "//")+2:]

	// TODO: Find a better way to do this + handle mutliple origins
	wconfig := &webauthn.Config{
		RPDisplayName: app.Settings().Meta.AppName, // Display Name for your site
		RPID:          domain,                      // Generally the FQDN for your site
		RPOrigins:     []string{origin},            // The origin URLs allowed for WebAuthn requests
	}

	if webAuthn, err = webauthn.New(wconfig); err != nil {
		fmt.Println(err)
	}

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// Start of the registration process
		se.Router.GET("/api/webauthn/registration-options", func(c *core.RequestEvent) error {
			user, err := findAuthRecordByUsernameOrEmail(app, c.Request.URL.Query()["usernameOrEmail"][0])
			if err != nil {
				return c.JSON(400, responses["failed"])
			}

			waUser := &WebAuthnUser{Record: user, App: app}
			options, session, err := webAuthn.BeginRegistration(waUser)
			if err != nil {
				return c.JSON(500, responses["reg_error"])
			}

			app.Store().Set("webauthn:session:"+user.Id, session)
			return c.JSON(200, options)
		})

		// Finish the registration process
		se.Router.POST("/api/webauthn/register", func(c *core.RequestEvent) error {
			info, _ := c.RequestInfo() // must get the request info to drain the body text
			user, err := findAuthRecordByUsernameOrEmail(app, info.Body["usernameOrEmail"].(string))
			if err != nil {
				return c.JSON(400, responses["failed"])
			}

			session := app.Store().Get("webauthn:session:" + user.Id).(*webauthn.SessionData)
			waUser := &WebAuthnUser{Record: user, App: app}
			creds, err := webAuthn.FinishRegistration(waUser, *session, c.Request)
			if err != nil {
				return c.JSON(500, responses["reg_error"])
			}

			if err := saveCredentials(app, user, *creds); err != nil {
				return c.JSON(500, responses["cred_error"])
			}
			return c.JSON(200, responses["reg_success"])
		})

		// Start of the login process
		se.Router.GET("/api/webauthn/login-options", func(c *core.RequestEvent) error {
			user, err := findAuthRecordByUsernameOrEmail(app, c.Request.URL.Query()["usernameOrEmail"][0])
			if err != nil {
				return c.JSON(400, responses["failed"])
			}

			waUser := &WebAuthnUser{Record: user, App: app}
			options, session, err := webAuthn.BeginLogin(waUser)
			if err != nil {
				return c.JSON(500, responses["login_error"])
			}

			app.Store().Set("webauthn:session:"+user.Id, session)
			return c.JSON(200, options)
		})

		// Finish the login process
		se.Router.POST("/api/webauthn/login", func(c *core.RequestEvent) error {
			info, _ := c.RequestInfo() // must get the request info to drain the body text
			user, err := findAuthRecordByUsernameOrEmail(app, info.Body["usernameOrEmail"].(string))
			if err != nil {
				return c.JSON(400, responses["failed"])
			}

			session := app.Store().Get("webauthn:session:" + user.Id).(*webauthn.SessionData)
			waUser := &WebAuthnUser{Record: user, App: app}
			creds, err := webAuthn.FinishLogin(waUser, *session, c.Request)
			if err != nil {
				return c.JSON(500, responses["login_error"])
			}

			if err := saveCredentials(app, user, *creds); err != nil {
				return c.JSON(500, responses["cred_error"])
			}
			return apis.RecordAuthResponse(c, user, "passkey", nil)
		})
		return se.Next()
	})
}
