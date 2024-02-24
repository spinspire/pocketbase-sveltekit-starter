package main

import (
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"pocketbase/auditlog"
	hooks "pocketbase/hooks"

	"github.com/joho/godotenv"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func defaultPublicDir() string {
	if strings.HasPrefix(os.Args[0], os.TempDir()) {
		// most likely ran with go run
		return "./pb_public/"
	}

	return filepath.Join(os.Args[0], "../pb_public/")
}

// use godot package to load/read the .env file and
// return the value of the key
func goDotEnvVariable(key string) string {

	// load .env file
	err := godotenv.Load(".env")

	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	return os.Getenv(key)
}

func chatGptHandler(c echo.Context) error {
	var requestBody struct {
		Prompt string `json:"prompt"`
	}

	log.Println("Received request to /api/chatgpt")

	if err := c.Bind(&requestBody); err != nil {
		// Before returning an error response
		log.Printf("Error in chatGptHandler: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	chatGPTAPIKey := goDotEnvVariable("CHATGPT_API_KEY")

	result, err := hooks.DoChatGPT(chatGPTAPIKey, requestBody.Prompt)
	if err != nil {
		// Before returning an error response
		log.Printf("Error in chatGptHandler: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate text from ChatGPT"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"result": result})
}

func dalleImageHandler(c echo.Context) error {
	var requestBody struct {
		Prompt string `json:"prompt"`
	}

	if err := c.Bind(&requestBody); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	dalleAPIKey := goDotEnvVariable("CHATGPT_API_KEY") // Ensure this is correctly named. Adjust according to your actual environment variable retrieval function
	prompt := requestBody.Prompt
	model := "dall-e-2" // Make sure to use the correct model name
	size := "256x256"   // Adjust based on what sizes your model supports

	b64Data, err := hooks.DoDalle3(dalleAPIKey, prompt, model, size)
	if err != nil {
		log.Printf("Error generating image: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate image"})
	}

	// Decode base64 string to []byte
	data, err := base64.StdEncoding.DecodeString(b64Data)
	if err != nil {
		log.Printf("Error decoding base64 data: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to decode image data"})
	}

	// Create a unique file name
	fileName := fmt.Sprintf("dalle_image_%v.png", time.Now().Unix())
	filePath := filepath.Join("./pb_public/", fileName) // Adjust the path as necessary

	// Write data to file
	err = os.WriteFile(filePath, data, 0644)
	if err != nil {
		log.Printf("Error writing image to file: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to save image file"})
	}

	// Construct the full URL to return
	url := fmt.Sprintf("http://localhost:8090/%s", fileName)

	// Return the full URL to the frontend
	return c.JSON(http.StatusOK, map[string]interface{}{"url": url})
}

func main() {
	app := pocketbase.New()

	var publicDirFlag string = "./pb_public" // Ensure this points to the correct directory

	// add "--publicDir" option flag
	app.RootCmd.PersistentFlags().StringVar(
		&publicDirFlag,
		"publicDir",
		defaultPublicDir(),
		"the directory to serve static files",
	)

	// load js files to allow loading external JavaScript migrations
	jsvm.MustRegister(app, jsvm.Config{
		HooksWatch: true, // make this false for production
	})

	// register the `migrate` command
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		TemplateLang: migratecmd.TemplateLangJS, // or migratecmd.TemplateLangGo (default)
		Automigrate:  true,
	})

	// call this only if you want to auditlog tables named in AUDITLOG env var
	auditlog.Register(app)

	// call this only if you want to use the configurable "hooks" functionality
	hooks.PocketBaseInit(app)

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {

		// Add this line to register the /api/chatgpt route
		e.Router.POST("/api/chatgpt", chatGptHandler)

		e.Router.POST("/api/dalle", dalleImageHandler)

		// serves static files from the provided public dir (if exists)
		e.Router.GET("/*", apis.StaticDirectoryHandler(os.DirFS(publicDirFlag), true))

		e.Router.AddRoute(echo.Route{
			Method: http.MethodGet,
			Path:   "/api/hello",
			Handler: func(c echo.Context) error {
				obj := map[string]interface{}{"message": "Hello world!"}
				return c.JSON(http.StatusOK, obj)
			},
			// Middlewares: []echo.MiddlewareFunc{
			// 	apis.RequireAdminOrUserAuth(),
			// },
		})

				return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
