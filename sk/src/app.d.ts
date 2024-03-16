// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
  // interface Locals {}
  // interface PageData {}
  // interface Error {}
  // interface Platform {}

  export interface PageData {
    post: {
      id : string;
      title : string;
      slug : string;
      body : string;
      tags : string[];
      blogSummary : string;
      featuredImage : string;
      userid : string;
      prompt : string;
    },
    featuredImageUrl?: string; // Add this line to include the featuredImageUrl
  }
}
