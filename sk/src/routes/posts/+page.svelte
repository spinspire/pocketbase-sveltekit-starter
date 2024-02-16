<script lang="ts">
  import { metadata } from "$lib/app/stores";
  import Image from "$lib/components/Image.svelte";
  import { authModel, watch } from "$lib/pocketbase";
  import type { PostsResponse } from "$lib/pocketbase/generated-types";
  import { alertOnFailure } from "$lib/pocketbase/ui";
  import { client } from "$lib/pocketbase";

  async function deleteAllPosts() {
    alertOnFailure(async () => {
      const postsResponse = await client.collection("posts").getList();
      for (const post of postsResponse.items) {
        await client.collection("posts").delete(post.id);
      }
      // Optionally, refresh the posts list or navigate as needed
    });
  }

  $metadata.title = "Recent Posts";
  const posts = watch<PostsResponse>("posts", {
    sort: "-updated",
  });
</script>

<style>
  .create-link, .edit-link, .delete-link {
    color: #007bff;
    text-decoration: none;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 14px;
  }

  .create-link:hover, .edit-link:hover, .delete-link:hover {
    text-decoration: underline;
  }

  .delete-all-button {
    background-color: #dc3545; /* Bootstrap danger color */
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border-radius: 5px;
    float: right; /* Aligns the button to the right */
  }

  .delete-all-button:hover {
    background-color: #c82333; /* Darker shade on hover */
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  td, th {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  img {
    width: 100px; /* Fixed width for images */
    height: auto; /* Maintain aspect ratio */
    border-radius: 5px;
  }

  .no-posts {
    text-align: center;
    padding: 20px;
  }

  .tag {
    display: inline-block;
    background-color: #333333;
    border-radius: 20px;
    padding: 3px 10px;
    margin: 2px;
    font-size: 12px;
  }
</style>

<div class="action-buttons">
  {#if $authModel}
    <a class="create-link" href="new/edit">Create New</a>
  {:else}
    <p>Please login to create new posts.</p>
  {/if}
  <button class="delete-all-button" on:click={deleteAllPosts}>Delete All Posts</button>
</div>
<hr />
{#if $posts.items.length > 0}
<table>
  <tbody>
    {#each $posts.items as post}
      {#if $authModel?.id == post.user}
        <tr>
          <td>
            {#if post.featuredImage}
              <img src={post.featuredImage} alt="Featured Pic" />
            {:else}
              <p>No featured image available.</p>
            {/if}
          </td>
          <td>
            <a class="post-link" href={"http://localhost:5173/posts/" + `${post.slug}`}>{post.title}</a>
          </td>
          <td>{post.updated}</td>
          <td>
            {#if post.tags && post.tags.length}
              {#each post.tags as tag}
                <span class="tag">{tag.trim()}</span>
              {/each}
            {:else}
              <span class="tag">No tags</span>
            {/if}
          </td>
          <td><a class="edit-link" href={`${post.id}/edit`}>Edit</a></td>
          <td><a class="delete-link" href={`${post.slug}#delete`}>Delete</a></td>
        </tr>
      {/if}
    {/each}
  </tbody>
</table>
{:else}
  <div class="no-posts">No posts found.</div>
{/if}