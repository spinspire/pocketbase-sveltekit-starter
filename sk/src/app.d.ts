import type { PocketBase } from "pocketbase"

declare global {
  namespace App {
    interface Locals {
      pb: PocketBase;
    }
  }
}

declare namespace App {
  export interface PageData {
    post?: {
      id: string;
      title: string;
      slug: string;
      body: string;
      tags: string[];
      blogSummary: string;
      featuredImage: string;
      userid: string;
      prompt: string;
    };
    featuredImageUrl?: string;
  }
}