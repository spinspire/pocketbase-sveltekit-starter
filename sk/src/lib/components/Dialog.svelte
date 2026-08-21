<script lang="ts">
  import type { Snippet } from "svelte";

  const {
    trigger = _trigger,
    children,
  }: { trigger?: Snippet<[() => void]>; children: Snippet<[]> } = $props();
  let dialog: HTMLDialogElement;
  function show() {
    dialog.showModal();
  }
  function close(e: MouseEvent) {
    if (e.target === dialog) {
      dialog.close();
    }
  }
</script>

{#snippet _trigger(show: () => void)}
  <button onclick={show}>Open</button>
{/snippet}

{@render trigger(show)}
<dialog bind:this={dialog} onclick={close}>
  <form method="dialog">
    <button class="ghost icon" aria-label="Close" onclick={() => dialog.close()}>
      <i class="bi bi-x-lg"></i>
    </button>
  </form>
  {@render children()}
</dialog>
