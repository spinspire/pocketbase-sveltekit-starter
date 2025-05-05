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
  import { metadata } from "$lib/metadata";

  const { data } = $props();
  const posts = $derived(data.posts);
  $effect(() => {
    $metadata.title = $metadata.headline = "Posts";
  });
  const store = activityStore(() =>
    client.send("/api/generate", { method: "post" })
  );
</script>

<LoginGuard>
  <nav class="no-space">
    <Link2Modal component={EditPage}>
      {#snippet trigger(onclick)}
        <a href="{base}/posts/new/edit" class="link-modal" {onclick}>
          <button class="border left-round">
            <span>New Post</span>
            <i class="bx bx-tada bx-list-plus"></i>
          </button>
        </a>
      {/snippet}
    </Link2Modal>
    <button
      class="right-round"
      type="button"
      onclick={store.run}
      disabled={$store}
    >
      {#if $store}
        <progress class="circle small"></progress>
      {/if}
      <span>Generate a random post</span>
    </button>
  </nav>
  {#snippet otherwise()}
    <p>Please Sign In to create/edit posts.</p>
  {/snippet}
</LoginGuard>

<Paginator store={posts} showIfSinglePage={true} />
{#each $posts.items as item}
  {@const [file] = item.files}
  <article class="no-padding">
    <!-- <a href={`${base}/posts/${item.slug || item.id}`}> -->
    <div class="grid no-space">
      <div class="s1">
        <Image record={item} {file} />
      </div>
      <div class="s11">
        <a class="body" href={`${base}/posts/${item.slug || item.id}`}>
          <div class="padding">
            <h5>{item.title}</h5>
            <div class="article-info">
              <i class="bx bx-calendar" title="on date"></i>
              {new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(
                new Date(item.updated)
              )}
              {#if item.expand?.user?.name}
                <i class="bx bx-pen" title="author"></i>
                {item.expand.user.name}
              {/if}
            </div>
          </div>
        </a>
      </div>
    </div>
  </article>
{:else}
  <div>No posts found. Create some.</div>
{/each}
<Paginator store={posts} showIfSinglePage={true} />

<style lang="scss">
  article {
    h5 {
      font-size: larger;
    }
    .body {
      justify-content: left;
      width: 100%;
    }
    .article-info {
      padding-top: 0.5rem;
    }
  }

  .link-modal {
    button {
      margin: 0;
    }
  }
</style>
