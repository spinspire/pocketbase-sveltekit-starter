<script lang="ts">
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import { metadata } from "$lib/app/stores";
  import Delete from "$lib/components/Delete.svelte";
  import { client } from "$lib/pocketbase";
  import type { PageData } from "./$types";
  export let data: PageData;
  $: ({
    post: { id, featuredImage, title, body, files },
  } = data);
  $: $metadata.title = title;
</script>

{#if $page.url.hash === "#delete"}
  <Delete table="posts" {id} />
{/if}

<div class="container">
  {#if featuredImage}
    <div class="image-wrapper">
      <img src={featuredImage} alt="Featured AI Pic" />
    </div>
  {/if}
  {#if files && files[0]}
    <div class="image-wrapper">
      <img
        src={client.getFileUrl(data.post, files[0], { thumb: "600x0" })}
        alt={title}
      />
    </div>
  {/if}
  <pre>{body}</pre>

  <a href={`${base}/auditlog/posts/${id}`} class="audit-log-button">
    AuditLog
  </a>
</div>

<style>
  .container {
    max-width: 800px;
    margin: auto;
    padding: 20px;
  }

  .image-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }

  img {
    max-width: 100%;
    height: auto; /* Maintain aspect ratio */
    border-radius: 8px; /* Modern look with rounded corners */
  }

  pre {
    background-color: #535353;
    padding: 15px;
    overflow-x: auto; /* Makes the pre tag scrollable horizontally if needed */
    white-space: pre-wrap; /* Ensures long lines wrap and are visible */
    word-wrap: break-word; /* Breaks long words to prevent horizontal scrolling */
    border-radius: 8px; /* Consistent with modern design */
  }

  .audit-log-button {
    background-color: #007bff; /* Bootstrap primary color */
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border-radius: 5px; /* Rounded corners for the button */
    text-decoration: none; /* Removes underline from the link */
    display: inline-block; /* Aligns button properly with text */
  }

  .audit-log-button:hover {
    background-color: #0056b3; /* Darker shade on hover */
  }
</style>