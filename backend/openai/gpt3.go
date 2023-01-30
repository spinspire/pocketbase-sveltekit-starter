package openai

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/labstack/echo/v5"
	gpt3 "github.com/sashabaranov/go-gpt3"
)

func Prompt(httpContext echo.Context) error {
	inputString := httpContext.QueryParam("input")
	inputString = strings.TrimSpace(inputString)
	if len(inputString) < 3 || len(inputString) > 500 {
		return httpContext.JSON(http.StatusBadRequest,
			map[string]string{"error": "Input must be between 3 and 500 characters"})
	}

	c := gpt3.NewClient(os.Getenv("OPENAI_KEY"))
	ctx := context.Background()

	maxTokens := 4096 - len(inputString)

	req := gpt3.CompletionRequest{
		Model:     gpt3.GPT3TextDavinci003,
		MaxTokens: maxTokens,
		Prompt:    inputString,
	}

	resp, err := c.CreateCompletion(ctx, req)

	if err != nil {
		fmt.Println("Error while accessing GPT3 API:")
		fmt.Println(err)
		return httpContext.JSON(http.StatusInternalServerError, err)
	}

	data := map[string]interface{}{"output": strings.TrimSpace(resp.Choices[0].Text)}
	return httpContext.JSON(http.StatusOK, data)
}
