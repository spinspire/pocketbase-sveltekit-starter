package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"pocketbase/hooks"
	"strings"
	"time"

	"errors"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
	"github.com/liushuangls/go-anthropic"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/forms"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/pocketbase/pocketbase/tools/filesystem"
)

type TextToImage struct {
	Base64       string `json:"base64"`
	Seed         uint32 `json:"seed"`
	FinishReason string `json:"finishReason"`
}

type TextToImageResponse struct {
	Images []TextToImage `json:"artifacts"`
}

// DreamStudioResponse is a placeholder for the actual response structure from DreamStudio.
type DreamStudioResponse struct {
	Images []struct {
		Base64 string `json:"base64"`
	} `json:"images"`
}

// ImageUploadResponse is the structure of the response returned after a successful image upload.
type ImageUploadResponse struct {
	ID string `json:"id"` // or URL if you prefer to return the image URL
}

const (
	PostsCollection         = "posts"
	ImagesCollection        = "images"
	DefaultAPIHost          = "https://api.stability.ai"
	StableDiffusionEngineID = "stable-diffusion-v1-6"
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

func servicesHandler(c echo.Context) error {
	services := []map[string]interface{}{
		{
			"name":   "Anthropic",
			"models": []string{"claude-instant-v1", "claude-instant-v1-100k"},
		},
		{
			"name":   "OpenAI",
			"models": []string{"gpt-3.5-turbo", "gpt-4"},
		},
	}

	return c.JSON(http.StatusOK, services)
}

func claudeHandler(c echo.Context) error {
	var requestBody struct {
		Text  string `json:"text"`
		Model string `json:"model"`
	}

	if err := c.Bind(&requestBody); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	client := anthropic.NewClient(goDotEnvVariable("ANTHROPIC_API_KEY"))

	resp, err := client.CreateMessages(context.Background(), anthropic.MessagesRequest{
		Model: requestBody.Model,
		Messages: []anthropic.Message{
			anthropic.NewUserTextMessage(requestBody.Text),
		},
		MaxTokens: 1000,
	})
	if err != nil {
		var e *anthropic.APIError
		if errors.As(err, &e) {
			fmt.Printf("Messages error, type: %s, message: %s", e.Type, e.Message)
		} else {
			fmt.Printf("Messages error: %v\n", err)
		}
		return err
	}

	fmt.Println(resp.Content[0].Text)

	return c.JSON(http.StatusOK, map[string]interface{}{"result": resp.Content[0].Text})
}

func chatGptHandler(c echo.Context) error {
	var requestBody struct {
		Text  string `json:"text"`
		Model string `json:"model"`
	}

	log.Println("Received request to /api/openai")

	if err := c.Bind(&requestBody); err != nil {
		log.Printf("Error in chatGptHandler: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	chatGPTAPIKey := goDotEnvVariable("CHATGPT_API_KEY")

	result, err := hooks.DoChatGPT(chatGPTAPIKey, requestBody.Text, requestBody.Model)
	if err != nil {
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
	size := "512x512"   // Adjust based on what sizes your model supports

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

func generateImage(requestBody map[string]interface{}, apiKey string) ([]byte, error) {
	// Build REST endpoint URL w/ specified engine
	apiHost := os.Getenv("API_HOST")
	if apiHost == "" {
		apiHost = "https://api.stability.ai"
	}

	reqUrl := apiHost + "/v1/generation/" + requestBody["engineId"].(string) + "/text-to-image"

	log.Printf("sending request to DreamStudio API: %v\n", reqUrl)

	jsonData, _ := json.Marshal(requestBody)

	req, _ := http.NewRequest("POST", reqUrl, bytes.NewBuffer(jsonData))
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Authorization", "Bearer "+apiKey)

	// Execute the request & read all the bytes of the body
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		var body map[string]interface{}
		if err := json.NewDecoder(res.Body).Decode(&body); err != nil {
			return nil, fmt.Errorf("Non-200 response from DreamStudio API: %v", err)
		}
		return nil, fmt.Errorf("Non-200 response from DreamStudio API: %v", body)
	}

	// Decode the JSON body
	var body TextToImageResponse
	if err := json.NewDecoder(res.Body).Decode(&body); err != nil {
		return nil, fmt.Errorf("failed to decode DreamStudio response: %v", err)
	}

	if len(body.Images) == 0 {
		return nil, errors.New("no images returned from DreamStudio")
	}

	// Get the first generated image
	generatedImage := body.Images[0]

	//log.Printf("generated image: %v\n", generatedImage)

	// Decode the base64 image data
	imageBytes, err := base64.StdEncoding.DecodeString(generatedImage.Base64)
	if err != nil {
		return nil, fmt.Errorf("failed to decode image data: %v", err)
	}

	return imageBytes, nil
}


func dreamStudioHandler(c echo.Context, app *pocketbase.PocketBase) error {
	var requestBody struct {
		Prompt   string `json:"prompt"`
		EngineId string `json:"engineId"`
	}
	if err := c.Bind(&requestBody); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	// Acquire an API key from the environment
	apiKey := os.Getenv("STABILITY_API_KEY")
	if apiKey == "" {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Missing STABILITY_API_KEY environment variable"})
	}

	requestData := map[string]interface{}{
		"text_prompts": []map[string]string{
			{"text": requestBody.Prompt},
		},
		"cfg_scale": 7,
		"height":    1024,
		"width":     1024,
		"samples":   1,
		"steps":     30,
		"engineId":  "stable-diffusion-xl-1024-v1-0",
	}

	log.Printf("generating image with request data: %v\n", requestData)

	imageBytes, err := generateImage(requestData, apiKey)
	if err != nil {
		log.Printf("Failed to generate image: %v\n", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate image"})
	}

	// Create a new record in the "images" collection
	collection, err := app.Dao().FindCollectionByNameOrId("images")
	if err != nil {
		log.Printf("Failed to find collection: %v\n", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to find collection"})
	}

	record := models.NewRecord(collection)

	// Create a new form for the record
	form := forms.NewRecordUpsert(app, record)

	// Set the form data
	form.LoadData(map[string]any{
		"originalName": "generated_image.png",
		"size":         len(imageBytes),
		"contentType":  "image/png",
	})

	// Create a new file from the image bytes
	file, err := filesystem.NewFileFromBytes(imageBytes, "generated_image.png")
	if err != nil {
		log.Printf("Failed to create file from bytes: %v\n", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create file from bytes"})
	}

	// Add the file to the form
	form.AddFiles("file", file)

	// Validate and submit the form
	if err := form.Submit(); err != nil {
		log.Printf("Failed to save image record: %v\n", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to save image record"})
	}

	return c.JSON(http.StatusOK, map[string]string{"id": record.Id})
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
	//auditlog.Register(app)

	// call this only if you want to use the configurable "hooks" functionality
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		// Register routes
		e.Router.POST("/api/dalle", dalleImageHandler)
		e.Router.POST("/api/dreamstudio", func(c echo.Context) error { return dreamStudioHandler(c, app) })
		e.Router.GET("/api/services", servicesHandler)
		e.Router.POST("/api/anthropic", claudeHandler)
		e.Router.POST("/api/openai", chatGptHandler)
		e.Router.GET("/*", apis.StaticDirectoryHandler(os.DirFS(publicDirFlag), true))
		log.Println("Serving static files from", publicDirFlag)
		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
