package main

import (
	"log"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
)

func main() {
	app := pocketbase.New()
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.AddRoute(echo.Route{
			Method: http.MethodGet,
			Path:   "/api/hello",
			Handler: func(c echo.Context) error {
				return c.JSON(200, map[string]interface{}{"message": "Hello world!"})
			},
			// Middlewares: []echo.MiddlewareFunc{
			// 	apis.RequireAdminOrUserAuth(),
			// },
		})
		app.OnModelAfterCreate().Add(func(e *core.ModelEvent) error {
			if table := e.Model.TableName(); table == "posts" {
				record := e.Model.(*models.Record)
				log.Printf("%s %+v\n", record.Id, record.Data())
			}
			return nil
		})

		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
