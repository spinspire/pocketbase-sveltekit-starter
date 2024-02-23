<script lang="ts">
import { base } from "$app/paths";
import { page } from "$app/stores";
import { metadata } from "$lib/app/stores";
import Delete from "$lib/components/Delete.svelte";
import { client } from "$lib/pocketbase";
import type { PageData } from "./$types";
import Markdown from 'svelte-markdown';
export let data: PageData;
$: ({
  post: { id, featuredImage, title, body, files },
} = data);
$: $metadata.title = title;
</script>

{#if $page.url.hash === "#delete"}
  <Delete table="posts" id={id} />
{/if}

<div class="prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto p-4">
  {#if featuredImage}
    <figure class="my-4">
      <img
        src={featuredImage}
        alt={title}
        class="rounded-lg shadow-md mx-auto"
      />
      <figcaption class="text-center text-sm mt-2">{title}</figcaption>
    </figure>
  {/if}
  {#if files && files[0]}
    <figure class="my-4">
      <img
        src={client.getFileUrl(data.post, files[0], { thumb: "600x0" })}
        alt={title}
        class="mx-auto"
      />
    </figure>
  {/if}

  <article class="prose lg:prose-lg mx-auto text-justify">
    <Markdown source={body} />
  </article>

  <div class="mt-8 text-center">
    <a href={`${base}/auditlog/posts/${id}`} class="btn btn-primary">
      Audit Log88
    </a>
  </div>
</div>




<style>
/* Additional custom styles can go here */
</style>
