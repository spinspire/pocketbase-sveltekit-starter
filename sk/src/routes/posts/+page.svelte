<script lang="ts">
  import { metadata } from "$lib/app/stores";
  import Image from "$lib/components/Image.svelte";
  import { authModel, watch } from "$lib/pocketbase";
  import type { PostsResponse } from "$lib/pocketbase/generated-types";
  $metadata.title = "Recent Posts";
  const posts = watch<PostsResponse>("posts", {
    sort: "-updated",
  });
</script>

{#if $authModel}
  <a href="new/edit">Create New</a>
{:else}
  <p>Please login to create new posts.</p>
{/if}
<hr />
<table>
  <tbody>
    {#each $posts.items as post}
      {#if $authModel?.id == post.user}
        <tr>
          <td>
            <Image
              record={post}
              file={post.files[0]}
              thumb="100x100"
              alt={post.title}
            />
          </td>
          <td><a href={post.slug}>{post.title}</a></td>
          <td>{post.updated}</td>
          <td><a href={`${post.id}/edit`}>Edit</a></td>
          <td><a href={`${post.slug}#delete`}>Delete</a></td>
        </tr>
      {:else}
        <tr>
          <td>
            <Image
              record={post}
              file={post.files[0]}
              thumb="100x100"
              alt={post.title}
            />
          </td>
          <td><a href={post.slug}>{post.title}</a></td>
          <td>{post.updated}</td>
        </tr>
      {/if}
    {:else}
      <tr>
        <td>No posts found.</td>
      </tr>
    {/each}
  </tbody>
</table>
