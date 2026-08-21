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
  <Link2Modal component={EditPage}>
    {#snippet trigger(onclick)}
      <a
        href={resolve("/posts/[id]/edit", { id: "new" })}
        role="button"
        {onclick}
      >
        New Post
        <i class="bi bi-plus-circle"></i>
      </a>
    {/snippet}
  </Link2Modal>
  <button type="button" onclick={store.run} disabled={$store} aria-busy={$store}>
    <Spinner active={$store} />
    Generate a random post
  </button>
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
  {@const thumbnail = client.files.getURL(item, file, { thumb: "100x100" })}
  <a href={resolve("/posts/[slug]", item)} class="post">
    <time class="date" datetime={item.updated}>
      <span class="dow">{new Date(item.updated).toLocaleDateString(undefined, { weekday: 'short' })}</span>
      <span class="mon">{new Date(item.updated).toLocaleDateString(undefined, { month: 'short' })}</span>
      <span class="dom">{new Date(item.updated).getDate()}</span>
    </time>
    <Image record={item} {file} />
    <div>
      <div>
        <i class="bi bi-calendar" title="on date"></i>
        {new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(
          new Date(item.updated)
        )}
        {#if item.expand?.user?.name}
          <i class="bi bi-pen" title="author"></i>
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
    gap: var(--space-4);
    padding-block: var(--space-4);
    text-decoration: none;
  }
  .post + .post {
    border-block-start: dashed 1px var(--border);
  }
  .date {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 4em;
    padding: var(--space-2);
    background: var(--muted);
    border-radius: var(--radius-medium);
    font-family: var(--font-alt);
    font-size: 0.85em;
    line-height: 1.2;
    flex-shrink: 0;
  }
  .date .dow { font-weight: 600; }
  .date .mon { text-transform: uppercase; font-size: 0.8em; opacity: 0.7; }
  .date .dom { font-size: 1.4em; font-weight: 700; }
</style>
