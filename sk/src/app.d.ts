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