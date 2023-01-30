package openai

import (
	"context"
	"fmt"
	"os"

	gpt3 "github.com/sashabaranov/go-gpt3"
)

func Prompt(inputString string) string {
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
		return err.Error()
	}

	return resp.Choices[0].Text
}
