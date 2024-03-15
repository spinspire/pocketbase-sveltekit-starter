package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	//"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	//"pocketbase/auditlog"
	hooks "pocketbase/hooks"

	"github.com/joho/godotenv"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	//"github.com/pocketbase/pocketbase/forms"
	//"github.com/pocketbase/pocketbase/models"

	// Create a new form for the record upsert
	//"github.com/pocketbase/filesystem"

)

type TextToImage struct {
	Base64       string `json:"base64"`
	Seed         uint32 `json:"seed"`
	FinishReason string `json:"finishReason"`
}

type TextToImageResponse struct {
	Images []TextToImage `json:"artifacts"` // Ensure the JSON tag matches the key in the response
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

type requestBodyStruct struct {
	Prompt string `json:"prompt"`
	Slug   string `json:"slug"`
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

// func imagesHandler(app *pocketbase.PocketBase, ) echo.HandlerFunc {
// 	return func(c echo.Context) error {
// 		// Parse the multipart form
// 		if err := c.Request().ParseMultipartForm(32 << 20); err != nil {
// 			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Failed to parse multipart form"})
// 		}

// 		// Retrieve the file from the form data
// 		file, _, err := c.Request().FormFile("file")
// 		if err != nil {
// 			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Failed to get the file from the form"})
// 		}
// 		defer file.Close()

// 		// Find the images collection
// 		collection, err := app.Dao().FindCollectionByNameOrId(ImagesCollection)
// 		if err != nil {
// 			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to find images collection"})
// 		}

// 		// Create a new record for the images collection
// 		record := models.NewRecord(collection)

// 		form := forms.NewRecordUpsert(app, record)

// 		// Manually upload the file using the local file path
// 		fileObject, err := filesystem.NewFileFromPath(localFilePath)

// 		if err != nil {
// 			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create file object from path"})
// 		}

// 		// Add the file to the form
// 		form.AddFiles("file", fileObject) // Replace "file" with the actual field name in the images collection

// 		// Validate and submit the form
// 		if err := form.Submit(); err != nil {
// 			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to save image record"})
// 		}

// 		// Return the response with the ID of the uploaded image
// 		return c.JSON(http.StatusOK, ImageUploadResponse{ID: record.Id})
// 	}
// }

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
	var requestBody struct {
		Prompt string `json:"prompt"`
	}
	if err := c.Bind(&requestBody); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	requestData := map[string]interface{}{
		"prompt": requestBody.Prompt,
		// Add additional required fields by DreamStudio API here
	}

	requestBodyJson, _ := json.Marshal(requestData)
	apiUrl := "https://api.dreamstudio.com/generate" // Placeholder URL

	req, _ := http.NewRequest("POST", apiUrl, bytes.NewBuffer(requestBodyJson))
	req.Header.Set("Authorization", "Bearer "+os.Getenv("DREAMSTUDIO_API_KEY"))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Failed to request DreamStudio: %v\n", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate image"})
	}
	defer resp.Body.Close()

	var dsResponse DreamStudioResponse

	if err := json.NewDecoder(resp.Body).Decode(&dsResponse); err != nil {
		log.Printf("Failed to decode DreamStudio response: %v\n", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to decode DreamStudio response"})
	}

	if len(dsResponse.Images) == 0 {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "No images returned from DreamStudio"})
	}

	// Assuming `firstImageBase64` is your base64 encoded image string.
	decodedImage, err := base64.StdEncoding.DecodeString(dsResponse.Images[0].Base64)
	if err != nil {
		log.Printf("Error decoding image: %v\n", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to decode image data"})
	}

	// Save decoded image as a temporary file
	// Ensure the ./pb_public/temp/ directory exists or adjust the path according to your setup
	tempFilePath := filepath.Join("./pb_public/temp/", fmt.Sprintf("temp_image_%v.png", time.Now().UnixNano()))
	if err := ioutil.WriteFile(tempFilePath, decodedImage, 0644); err != nil {
		log.Printf("Error saving temp image file: %v\n", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to save temp image file"})
	}

	// Construct a URL to access the temporary image
	
	tempFileURL := fmt.Sprintf("http://localhost:8090/%s", strings.TrimPrefix(tempFilePath, "./pb_public/"))

	return c.JSON(http.StatusOK, map[string]interface{}{"imageUrl": tempFileURL})
}

/* fileName := fmt.Sprintf("dreamstudio_image_%v.png", time.Now().Unix())
filePath := filepath.Join("./pb_public/", fileName)

err = os.WriteFile(filePath, imageData, 0644)
if err != nil {
	log.Printf("Error writing image to file: %v\n", err)
	return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to save image file"})
}

url := fmt.Sprintf("http://localhost:8090/%s", fileName)

log.Println("Returning image URL to the client")
return c.JSON(http.StatusOK, map[string]interface{}{"url": url}) */

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
	hooks.PocketBaseInit(app)

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {

		// Register all specific routes before the wildcard static file handler
		e.Router.POST("/api/chatgpt", chatGptHandler)
		e.Router.POST("/api/dalle", dalleImageHandler)

		// Register the /api/images route with the imagesHandler
		//e.Router.POST("/api/images", imagesHandler(app))
		e.Router.POST("/api/dreamstudio", dreamStudioHandler)
		// Now register the static file handler
		e.Router.GET("/*", apis.StaticDirectoryHandler(os.DirFS(publicDirFlag), true))

		log.Println("Serving static files from", publicDirFlag)

		/* e.Router.AddRoute(echo.Route{
		Method: http.MethodGet,
		Path:   "/api/hello",
		Handler: func(c echo.Context) error {
			obj := map[string]interface{}{"message": "Hello world!"}
			return c.JSON(http.StatusOK, obj)
		}, */
		// Middlewares: []echo.MiddlewareFunc{
		// 	apis.RequireAdminOrUserAuth(),
		// },
		//})

		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
