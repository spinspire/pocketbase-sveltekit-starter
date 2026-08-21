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
      <button class="ghost icon" aria-label="Close">
        <i class="bi bi-x-lg"></i>
      </button>
    </form>
    <div class="modal-body">
      <Alerts />
      <h2>{$metadata.headline}</h2>
      <Comp data={$page.state.selected}></Comp>
    </div>
  </dialog>
{/if}

{@render trigger(onclick)}

<style>
  dialog {
    border: none;
    border-radius: var(--radius-medium);
    padding: 0;
    max-width: 90vw;
    max-height: 90vh;
    color: light-dark(var(--color-1), var(--color-1));
    background: light-dark(var(--bg-1), var(--bg-1));
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }
  dialog > form {
    display: flex;
    justify-content: flex-end;
    padding: var(--space-2);
    padding-bottom: 0;
  }
  .modal-body {
    padding: var(--space-4);
  }
</style>
