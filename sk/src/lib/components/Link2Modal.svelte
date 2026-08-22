<script lang="ts">
  import { invalidateAll, preloadData, pushState } from "$app/navigation";
  import { page } from "$app/stores";
  import type { Component, Snippet } from "svelte";
  import Alerts from "./Alerts.svelte";
  import { metadata } from "$lib/metadata";

  const {
    component: Comp,
    trigger,
  }: {
    trigger: Snippet<[(e: MouseEvent) => void]>;
    component: Component;
  } = $props();

  let dialog: HTMLDialogElement | undefined = $state();

  async function onclick(e: MouseEvent) {
    if (e.metaKey || e.ctrlKey) return;
    const { href } = e.currentTarget as HTMLAnchorElement;
    const result = await preloadData(href);
    if (result.type === "loaded" && result.status === 200) {
      pushState(href, { selected: result.data });
      e.preventDefault();
    }
  }

  async function onclose() {
    await invalidateAll();
    history.back();
  }

  $effect(() => {
    if ($page.state.selected && dialog) {
      dialog.showModal();
    }
  });
</script>

{#if $page.state.selected}
  <dialog bind:this={dialog} {onclose}>
    <form method="dialog">
      <header>
        <button class="ghost icon" aria-label="Close">
          <i class="bi bi-x-lg"></i>
        </button>
      </header>
      <div>
        <h2>{$metadata.headline}</h2>
        <Alerts />
        <Comp data={$page.state.selected}></Comp>
      </div>
    </form>
  </dialog>
{/if}

{@render trigger(onclick)}
