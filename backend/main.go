package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	hooks "pocketbase/hooks"
	"pocketbase/openai"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

var welcomeText string = `Pollamin is a highly experimental site that attempts to aggregate and simplify API access
to AI services like OpenAI, DallE, etc.<br/>
It is free for now, but please use the API responsibly! It costs us money every time you make a single request.`

func getEnvFilePath() string {
	path, err := os.Executable()
	if err != nil {
		panic("Could not call os.Executable")
	}

	path = filepath.Dir(path)

	return path + "/.env"
}

func defaultPublicDir() string {
	// if strings.HasPrefix(os.Args[0], os.TempDir()) {
	// 	// most likely ran with go run
	// 	return "./pb_public"
	// }
	// return filepath.Join(os.Args[0], "../pb_public")

	path, err := os.Executable()
	if err != nil {
		panic("Could not call os.Executable")
	}

	path = filepath.Dir(path)

	return path + "/build"
}

func main() {
	fmt.Println("---------------------------------")
	fmt.Println("----------- POLLAMIN ------------")
	fmt.Println("---------------------------------")

	e := godotenv.Load(getEnvFilePath())
	if e != nil {
		fmt.Println("WARNING: Could not load .env file")
	} else {
		fmt.Println("Loaded env file: " + getEnvFilePath())
	}
	////////////////////////////////////////////////////////

	app := pocketbase.New()

	var publicDirFlag string

	// add "--publicDir" option flag
	app.RootCmd.PersistentFlags().StringVar(
		&publicDirFlag,
		"publicDir",
		defaultPublicDir(),
		"the directory to serve static files",
	)
	migrationsDir := "" // default to "pb_migrations" (for js) and "migrations" (for go)

	// load js files to allow loading external JavaScript migrations
	jsvm.MustRegisterMigrations(app, &jsvm.MigrationsOptions{
		Dir: migrationsDir,
	})

	// register the `migrate` command
	migratecmd.MustRegister(app, app.RootCmd, &migratecmd.Options{
		TemplateLang: migratecmd.TemplateLangJS, // or migratecmd.TemplateLangGo (default)
		Dir:          migrationsDir,
		Automigrate:  true,
	})

	// call this only if you want to use the configurable "hooks" functionality
	err := hooks.PocketBaseInit(app)
	if err != nil {
		panic("PocketBaseInit Failed")
	}

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		// serves static files from the provided public dir (if exists)
		cwd, _ := os.Getwd()
		fmt.Println("Current folder:", cwd)
		fmt.Println("Static assests folder: ", publicDirFlag)
		e.Router.GET("/*", apis.StaticDirectoryHandler(os.DirFS(publicDirFlag), true))

		_, err = e.Router.AddRoute(echo.Route{
			Method: http.MethodGet,
			Path:   "/api/hello",
			Handler: func(c echo.Context) error {
				obj := map[string]interface{}{"output": welcomeText}
				return c.JSON(http.StatusOK, obj)
			},
			// Middlewares: []echo.MiddlewareFunc{
			// 	apis.RequireAdminOrUserAuth(),
			// },
		})

		_, err = e.Router.AddRoute(echo.Route{
			Method: http.MethodGet,
			Path:   "/api/davinci",
			Handler: func(ctx echo.Context) error {
				return openai.Prompt(ctx)
			},
		})

		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
