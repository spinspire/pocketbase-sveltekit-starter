<script lang="ts">
  import Image from "$lib/pocketbase/Image.svelte";
  import Link2Modal from "$lib/components/Link2Modal.svelte";
  import { client } from "$lib/pocketbase";
  import EditPage from "./[slug]/edit/+page.svelte";
  import LoginGuard from "$lib/components/LoginGuard.svelte";
  import Paginator from "$lib/pocketbase/Paginator.svelte";
  import Spinner from "$lib/components/Spinner.svelte";
  import { activityStore } from "$lib/activity";
  import { metadata } from "$lib/metadata";
  import { resolve } from "$app/paths";

  const { data } = $props();
  const posts = $derived(data.posts);
  $effect(() => {
    $metadata.title = $metadata.headline = "Posts";
  });
  const store = activityStore(() =>
    client.send("/api/generate", { method: "post" })
  );
</script>

<LoginGuard admin={false}>
  <div class="hstack gap-2 toolbar">
    <Link2Modal component={EditPage}>
      {#snippet trigger(onclick)}
        <a
          href={resolve("/posts/[id]/edit", { id: "new" })}
          role="button"
          {onclick}
        >
          <i class="bi bi-plus-lg"></i>
          New Post
        </a>
      {/snippet}
    </Link2Modal>
    <button type="button" onclick={store.run} disabled={$store} aria-busy={$store}>
      <Spinner active={$store} />
      <i class="bi bi-shuffle"></i>
      Generate
    </button>
  </div>
  {#snippet otherwise()}
    <p>
      Please Sign In (as non-superuser) to create/edit posts. Use the test
      credentials from <code>.env</code> (<code>PB_USER_EMAIL</code> /
      <code>PB_USER_PASSWORD</code>), or <a
        href="/_/#/collections?collection=_pb_users_auth_">create a user</a
      > in the admin UI.
    </p>
  {/snippet}
</LoginGuard>

<Paginator store={posts} showIfSinglePage={true} />
{#each $posts.items as item}
  {@const [file] = item.files}
  <a href={resolve("/posts/[slug]", item)} class="post">
    <div class="thumb">
      <Image record={item} {file} />
    </div>
    <div>
      <div class="meta">
        <i class="bi bi-calendar"></i>
        {new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(
          new Date(item.updated)
        )}
        {#if item.expand?.user?.name}
          <i class="bi bi-pen"></i>
          {item.expand.user.name}
        {/if}
      </div>
      <h2>{item.title}</h2>
    </div>
  </a>
{:else}
  <div>No posts found. Create some.</div>
{/each}
<Paginator store={posts} showIfSinglePage={true} />

<style>
  .post {
    color: inherit;
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding-block: var(--space-4);
    text-decoration: none;
  }
  .post + .post {
    border-block-start: dashed 1px var(--border);
  }
  .meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-sm);
    color: var(--muted-fg);
    margin-block-end: var(--space-1);
  }
  .meta .bi {
    font-size: 0.85em;
    opacity: 0.6;
  }
  .meta + h2 {
    margin: 0;
  }
  .thumb {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    flex-shrink: 0;
  }
  .thumb :global(img) {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: var(--radius-medium);
  }
  .toolbar a,
  .toolbar button {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--border);
    border-radius: var(--radius-medium);
    background: transparent;
    color: inherit;
    text-decoration: none;
    font: inherit;
    cursor: pointer;
  }
  .toolbar a:hover,
  .toolbar button:hover {
    background: var(--faint);
  }
</style>
