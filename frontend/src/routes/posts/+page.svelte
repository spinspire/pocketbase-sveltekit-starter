<script lang="ts">
  export let data: PageData;
  $: ({ posts } = data);

  import { metadata } from "$lib/app/stores";
  import Image from "$lib/components/Image.svelte";
  import { client } from "$lib/pocketbase";
  import type { PageData } from ".svelte-kit/types/src/routes/posts/$types";
  $metadata.title = "Recent Posts";
</script>

<a href="new/edit">Create New</a>
<hr />
<table>
  <tbody>
    {#each posts as post}
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
        <td>No posts found.</td>
      </tr>
    {/each}
  </tbody>
</table>
