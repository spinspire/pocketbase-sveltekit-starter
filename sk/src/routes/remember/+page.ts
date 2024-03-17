import type { PageLoad } from './$types';
import { client } from '$lib/pocketbase';

export const load: PageLoad = async () => {
    try {
      client.autoCancellation(false);
  
      // Fetch posts
      const postsResponse = await client.collection('posts').getList(1, 50, {
        sort: '-updated',
      });
  
      // Extract the posts from the response
      const posts = postsResponse.items;
  
      // Fetch tags for each post
      for (const post of posts) {
        // Fetch postsTags records associated with the current post
        const postsTagsResponse = await client.collection('postsTags').getList(1, 50, {
          filter: `posts = "${post.id}"`,
        });
  
        // Extract the tag IDs from the postsTags records
        const tagIds = postsTagsResponse.items.map((postTag) => postTag.tags);
  
        // Fetch the tag details for each tag ID
        const tags = await Promise.all(
          tagIds.map((tagId) => client.collection('tags').getOne(tagId))
        );
  
        // Map the tags to their titles and assign to post.tags
        post.tags = tags.map(tag => tag.title);

        console.log("post.tags", post.tags);
      }
  
      client.autoCancellation(true);
  
      return {
        posts,
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      return {
        posts: [],
      };
    }
  };