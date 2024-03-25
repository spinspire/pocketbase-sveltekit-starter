<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from "$app/navigation";
  import { client } from "$lib/pocketbase";
  import { alertOnFailure } from "$lib/pocketbase/ui";
  import Image from "./Image.svelte"; // Make sure the path is correct
  import type { PostsResponse } from "$lib/pocketbase/generated-types";

  export let id: string;
  export let table: string;

  let post: PostsResponse | null = null;

  async function loadPost() {
    try {
      const fetchedPost = await client.collection(table).getOne(id);
      post = fetchedPost as unknown as PostsResponse;
    } catch (error) {
      console.error("Failed to load post", error);
      alert("Failed to load post details.");
    }
  }

  async function submit() {
    alertOnFailure(async () => {
      console.log(`Attempting to delete record with ID: ${id} from table: ${table}`);
      await client.collection(table).delete(id);
      goto("/remember");
    });
  }

  onMount(() => {
    loadPost();
  });
</script>

<div class="flex justify-center items-center h-screen">
  {#if post}
    <form on:submit|preventDefault={submit} class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
      <div class="card-body">
        <figure>
          <Image {post} alt={post?.title || 'Post image'} className="w-full h-auto" />
        </figure>
        <h2 class="card-title">{post?.title}</h2>
        <p>Are you sure you want to delete this post?</p>
        <div class="card-actions justify-end">
          <button type="button" class="btn btn-outline btn-accent" on:click={() => goto("/remember")}>No - Cancel</button>
          <button type="submit" class="btn btn-primary">Yes - Proceed</button>
        </div>
      </div>
    </form>
  {:else}
    <p>Loading post details...</p>
  {/if}
</div>
