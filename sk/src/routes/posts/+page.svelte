<script lang="ts">
  import { base } from "$app/paths";
  import DateShow from "$lib/components/DateShow.svelte";
  import Image from "$lib/pocketbase/Image.svelte";
  import Link2Modal from "$lib/components/Link2Modal.svelte";
  import { client } from "$lib/pocketbase";
  import EditPage from "./[slug]/edit/+page.svelte";
  import LoginGuard from "$lib/components/LoginGuard.svelte";
  import Paginator from "$lib/pocketbase/Paginator.svelte";
  import Spinner, { activityStore } from "$lib/components/Spinner.svelte";

  const { data } = $props();
  const posts = $derived(data.posts);
  $effect(() => {
    data.metadata.title = data.metadata.headline = "Posts";
  });
  const store = activityStore(() =>
    client.send("/api/generate", { method: "post" })
  );
</script>

<LoginGuard>
  <Link2Modal component={EditPage}>
    {#snippet trigger(onclick)}
      <a href="{base}/posts/new/edit" class="button" {onclick}>
        New Post
        <i class="bx bx-tada bx-list-plus"></i>
      </a>
    {/snippet}
  </Link2Modal>
  <button type="button" onclick={store.run} disabled={$store}
    ><Spinner active={$store} />
    Generate a random post
  </button>
  {#snippet otherwise()}
    <p>Please Sign In to create/edit posts.</p>
  {/snippet}
</LoginGuard>

<Paginator store={posts} showIfSinglePage={true} />
{#each $posts.items as item}
  {@const [file] = item.files}
  {@const thumbnail = client.files.getUrl(item, file, { thumb: "100x100" })}
  <a href={`${base}/posts/${item.slug || item.id}`} class="post">
    <DateShow date={item.updated} />
    <Image record={item} {file} />
    <div>
      <div>
        <i class="bx bx-calendar" title="on date"></i>
        {new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(
          new Date(item.updated)
        )}
        {#if item.expand?.user?.name}
          <i class="bx bx-pen" title="author"></i>
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

<style lang="scss">
  .post {
    color: inherit;
    display: flex;
    gap: 1rem;
    padding-block: 1rem;
    & + .post {
      border-block-start: dashed 1px;
    }
  }
</style>
