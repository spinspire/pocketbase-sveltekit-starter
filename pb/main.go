package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"pocketbase/webauthn"
	"strings"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func defaultPublicDir() string {
	if strings.HasPrefix(os.Args[0], os.TempDir()) {
		// most likely ran with go run
		return "./pb_public"
	}

	return filepath.Join(os.Args[0], "../pb_public")
}

func main() {
	app := pocketbase.New()

	var hooksDir string
	app.RootCmd.PersistentFlags().StringVar(
		&hooksDir,
		"hooksDir",
		"",
		"the directory with the JS app hooks",
	)

	var hooksWatch bool
	app.RootCmd.PersistentFlags().BoolVar(
		&hooksWatch,
		"hooksWatch",
		true,
		"auto restart the app on pb_hooks file change",
	)

	var hooksPool int
	app.RootCmd.PersistentFlags().IntVar(
		&hooksPool,
		"hooksPool",
		25,
		"the total prewarm goja.Runtime instances for the JS app hooks execution",
	)

	var migrationsDir string
	app.RootCmd.PersistentFlags().StringVar(
		&migrationsDir,
		"migrationsDir",
		"pb_migrations",
		"the directory with the user defined migrations",
	)

	var automigrate bool
	app.RootCmd.PersistentFlags().BoolVar(
		&automigrate,
		"automigrate",
		true,
		"enable/disable auto migrations",
	)

	var publicDir string
	app.RootCmd.PersistentFlags().StringVar(
		&publicDir,
		"publicDir",
		defaultPublicDir(),
		"the directory to serve static files",
	)

	var indexFallback bool
	app.RootCmd.PersistentFlags().BoolVar(
		&indexFallback,
		"indexFallback",
		true,
		"fallback the request to index.html on missing static path (eg. when pretty urls are used with SPA)",
	)

	app.RootCmd.ParseFlags(os.Args[1:])

	// TODO: get this working again
	// load js files to allow loading external JavaScript migrations
	// jsvm.MustRegister(app, jsvm.Config{
	// 	MigrationsDir: migrationsDir,
	// 	HooksWatch:    true, // make this false for production
	// 	OnInit: func(vm *goja.Runtime) {
	// 		vm.Set("foo", "this var was injected into JSVM by Go")
	// 	},
	// })

	// register the `migrate` command
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		TemplateLang: migratecmd.TemplateLangJS, // or migratecmd.TemplateLangGo (default)
		Automigrate:  true,
	})

	/*
	 * Use this only if you want to do audit logging of tables named in AUDITLOG
	 * env var (e.g. AUDITLOG=users,posts) impelemented in Go.
	 * Keep in mind that there is already a JSVM implementation of this feature in ./pb_hooks dir.
	 */
	// auditlog.Register(app)

	/*
	 * Use this only if you want to use the "hooks" implemented in Go.
	 * It's probably better to use hooks in JSVM though. See "auditlog" example
	 * in ./pb_hooks.
	 */
	// hooks.Register(app)

	// register the webauthn plugin
	webauthn.Register(app)

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// serves static files from the provided public dir (if exists)
		se.Router.GET("/*", apis.Static(os.DirFS(publicDir), indexFallback))

		se.Router.GET("/api/go-hello", func(e *core.RequestEvent) error {
			return e.JSON(http.StatusOK, map[string]string{"message": "Hello world from Go!"})
		})

		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
