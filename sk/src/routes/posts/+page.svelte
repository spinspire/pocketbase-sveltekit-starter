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

<div>
  <span>
    {#if $authModel}
      <a href="new/edit">Create New</a>
    {:else}
      <p>Please login to create new posts.</p>
    {/if}
    <div style="text-align: right;">
      <button on:click={deleteAllPosts}>Delete All Posts</button>
    </div></span
  >
</div>
<hr />
<table>
  <tbody>
    {#each $posts.items as post}
      {#if $authModel?.id == post.user}
        <tr>
          <td>
            <!-- Display the featured image -->
            {#if post.featuredImage}
              <img src={post.featuredImage} alt="Featured pic" />
            {:else}
              <p>No featured image available.</p>
            {/if}
          </td>
          <td><a href={"http://localhost:5173/posts/" + `${post.slug}`}>{post.title}</a></td>
          <td>{post.updated}</td>
          {#if post.tags}
            {#each post.tags as tag}
              <span class="tag">{tag.trim()}</span>
            {/each}
          {:else}
            <span class="tag">No tags</span>
          {/if}
          <td><a href={`${post.id}/edit`}>Edit</a></td>
          <td><a href={`${post.slug}#delete`}>Delete</a></td>
        </tr>
      {:else}
        <tr>
          <td>
            <!-- Display the featured image -->
            {#if post.featuredImage}
              <img src={post.featuredImage} alt="Featured pic" />
            {:else}
              <p>No featured image available.</p>
            {/if}
          </td>
          <td><a href={post.slug}>{post.title}</a></td>
          <td>{post.updated}</td>
          {#if post.tags}
            <span class="tag">{post.tags}</span>
          {/if}
        </tr>
      {/if}
    {:else}
      <tr>
        <td>No posts found.</td>
      </tr>
    {/each}
  </tbody>
</table>
