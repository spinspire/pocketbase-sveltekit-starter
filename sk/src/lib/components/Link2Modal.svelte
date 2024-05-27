<script lang="ts">
  import { invalidateAll, preloadData, pushState } from "$app/navigation";
  import { page } from "$app/stores";
  import type { ComponentType, Snippet, SvelteComponent } from "svelte";
  import Alerts from "./Alerts.svelte";

  const {
    component,
    trigger,
  }: {
    trigger: Snippet<[(e: MouseEvent) => void]>;
    component: ComponentType<SvelteComponent<{ data: any }>>;
  } = $props();

  let dialog: HTMLDialogElement | undefined = $state();

  async function onclick(e: MouseEvent) {
    if (e.metaKey || e.ctrlKey) return;
    const { href } = e.currentTarget as HTMLAnchorElement;

    // run `load` functions (or rather, get the result of the `load` functions
    // that are already running because of `data-sveltekit-preload-data`)
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
    <button type="button" class="dismiss" onclick={onclose}>&times;</button>
    <Alerts />
    <h2>{$page.state.selected.metadata.headline}</h2>
    <svelte:component this={component} data={$page.state.selected} />
  </dialog>
{/if}

{@render trigger(onclick)}

<style>
  .dismiss {
    border-radius: 5rem;
    padding: 0 0;
    width: 2em;
    height: 2em;
    position: absolute;
    top: 0;
    right: 0;
    margin: 6px 6px;
  }
</style>
