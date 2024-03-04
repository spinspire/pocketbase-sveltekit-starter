package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
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

type TextToImageImage struct {
	Base64       string `json:"base64"`
	Seed         uint32 `json:"seed"`
	FinishReason string `json:"finishReason"`
}

type TextToImageResponse struct {
	Images []TextToImageImage `json:"artifacts"` // Ensure the JSON tag matches the key in the response
}

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

func dreamStudioHandler(c echo.Context) error {
    log.Println("Starting dreamStudioHandler...")

    var requestBody struct {
        Prompt string `json:"prompt"`
    }

    if err := c.Bind(&requestBody); err != nil {
        log.Printf("Error binding request body: %v\n", err)
        return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
    }

    log.Printf("Received prompt: %s\n", requestBody.Prompt)

    // Define request data with the user's prompt
    requestData := map[string]interface{}{
        "text_prompts": []map[string]string{
            {"text": requestBody.Prompt},
        },
        "cfg_scale": 7,
        "height":    512,
        "width":     512,
        "samples":   1,
        "steps":     30,
    }

    requestBodyJson, err := json.Marshal(requestData)
    if err != nil {
        log.Printf("Error marshaling request body: %v\n", err)
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error marshaling request body"})
    }

    apiHost := os.Getenv("API_HOST")
    if apiHost == "" {
        apiHost = "https://api.stability.ai"
    }
    engineId := "stable-diffusion-v1-6"
    reqUrl := fmt.Sprintf("%s/v1/generation/%s/text-to-image", apiHost, engineId)

    apiKey := os.Getenv("STABILITY_API_KEY")
    if apiKey == "" {
        log.Println("STABILITY_API_KEY is missing")
        return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing STABILITY_API_KEY environment variable"})
    }

    req, err := http.NewRequest("POST", reqUrl, bytes.NewBuffer(requestBodyJson))
    req.Header.Add("Content-Type", "application/json")
    req.Header.Add("Authorization", "Bearer "+apiKey)

    res, err := http.DefaultClient.Do(req)
    if err != nil || res.StatusCode != 200 {
        log.Printf("Failed to execute request or non-200 status code: %v, status code: %d\n", err, res.StatusCode)
        body, _ := io.ReadAll(res.Body)
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to execute request or non-200 status code: " + string(body)})
    }
    defer res.Body.Close()

    var response TextToImageResponse
    if err := json.NewDecoder(res.Body).Decode(&response); err != nil {
        log.Printf("Failed to parse response body: %v\n", err)
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to parse response body"})
    }

    if len(response.Images) == 0 {
        log.Println("No images returned from API")
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": "No images returned from API"})
    }

    // Correctly handle base64 decoding
    firstImage := response.Images[0]
    imageData, err := base64.StdEncoding.DecodeString(firstImage.Base64)
    if err != nil {
        log.Printf("Error decoding base64 data: %v\n", err)
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to decode image data"})
    }

    fileName := fmt.Sprintf("dreamstudio_image_%v.png", time.Now().Unix())
    filePath := filepath.Join("./pb_public/", fileName)

    err = os.WriteFile(filePath, imageData, 0644)
    if err != nil {
        log.Printf("Error writing image to file: %v\n", err)
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to save image file"})
    }

    url := fmt.Sprintf("http://localhost:8090/%s", fileName)

    log.Println("Returning image URL to the client")
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

		// New Dream Studio API route
		e.Router.POST("/api/dreamstudio", dreamStudioHandler)

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
