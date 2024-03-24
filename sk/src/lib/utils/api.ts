// src/lib/utils/api.ts
// Improved error handling and abstraction of API URL and parameters

import { env } from "$env/dynamic/public";
import { client } from "$lib/pocketbase";

const engineId = "stable-diffusion-v1-6";
const apiHost = import.meta.env.VITE_STABILITY_API_HOST;

const API_BASE_URL = import.meta.env.VITE_APP_BASE_URL;
const CHATGPT_KEY = import.meta.env.VITE_CHATGPT_API_KEY;
const SD_KEY = import.meta.env.VITE_STABILITY_API_KEY;
const CLAUDE_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const DALLE_KEY = import.meta.env.VITE_CHATGPT_API_KEY;

//validate that keys are present
if (!API_BASE_URL) {
  throw new Error("Missing APP_BASE_URL");
}
if (!CHATGPT_KEY) {
  throw new Error("Missing CHATGPT_API_KEY");
}
if (!SD_KEY) {
  throw new Error("Missing STABILITY_API_KEY");
}
if (!CLAUDE_KEY) {
  throw new Error("Missing ANTHROPIC_API_KEY");
}
if (!DALLE_KEY) {
  throw new Error("Missing DALLE_API_KEY");
}

export async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body: any = null
): Promise<T> {
  const headers = { "Content-Type": "application/json" };
  const config: RequestInit = { method, headers };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      // Assuming the response includes a JSON body with an error message
      const errorBody = await response.json();
      throw new Error(
        errorBody.message || `Request failed with status ${response.status}`
      );
    }
    return await response.json();
  } catch (error) {
    // Log the error to an error reporting service if you have one
    console.error("API Request failed:", error);
    throw error;
  }
}

export async function ensureTagsExist(tags: string[]): Promise<string[]> {
  const existingTags = await client.collection("tags").getFullList({
    filter: tags.map((tag) => `title = "${tag}"`).join(" || "),
  });

  const existingTagTitles = existingTags.map((tag) => tag.title);
  const newTagTitles = tags.filter((tag) => !existingTagTitles.includes(tag));

  const newTags = await Promise.all(
    newTagTitles.map((title) => client.collection("tags").create({ title }))
  );

  return [...existingTags, ...newTags].map((tag) => tag.id);
}

export async function getTagsForPost(slug: string): Promise<string> {
  try {
    console.log("Fetching tags for post", slug);
    const postsResponse = await client.collection("posts").getFirstListItem(`slug = "${slug}"`, {
      expand: "tags",
    });
    if (!postsResponse) {
      return "";
    }

    const tags = postsResponse.expand?.tags?.map((tag: { title: any; }) => tag.title) || [];
    console.log("Tags for post", slug, tags);
    return tags.join(", ");
  } catch (error) {
    console.error("Error fetching tags:", error);
    return "";
  }
}

export async function generateTextFromClaude(prompt: string): Promise<string> {
  try {
    console.log("Generating text from Claude", prompt);
    const response = await fetch("/api/proxy/anthropic", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        human: prompt,
      }),
    });
    console.log("Response from Claude", response);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function generateImageFromDalle(prompt: string): Promise<string> {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DALLE_KEY}`,
        },
        body: JSON.stringify({
          model: "image-alpha-001",
          prompt: prompt,
          num_images: 1,
          size: "512x512",
          response_format: "url",
        }),
      }
    );
    if (!response.ok) throw new Error("Failed to generate image from Dalle");

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function generateImageFromDreamStudio(
  prompt: string
): Promise<string> {
  try {
    const response = await fetch(
      `https://api.stability.ai/v1/generation/${engineId}/text-to-image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SD_KEY}`,
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          clip_guidance_preset: "FAST_BLUE",
          height: 512,
          width: 512,
          samples: 1,
          steps: 30,
        }),
      }
    );
    console.log("Response from DreamStudio", response);
    if (!response.ok)
      throw new Error("Failed to generate image from DreamStudio");
    const data = await response.json();
    return data.artifacts[0].base64;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function generateTextFromChatGPT(prompt: string): Promise<string> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CHATGPT_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024,
        n: 1,
        stop: null,
        temperature: 0.5,
        top_p: 0.5,
      }),
    });
    if (!response.ok) throw new Error("Failed to generate text from ChatGPT");
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
