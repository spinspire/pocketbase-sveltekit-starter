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
  <header>
    <button class="ghost icon" aria-label="Close" onclick={() => dialog.close()}>
      <i class="bi bi-x-lg"></i>
    </button>
  </header>
  <div class="dialog-body">
    {@render children()}
  </div>
</dialog>

<style>
  dialog {
    border: 1px solid var(--border);
    border-radius: var(--radius-medium);
    padding: 0;
    max-width: 90vw;
    max-height: 90vh;
    color: light-dark(var(--color-1), var(--color-1));
    background-color: light-dark(var(--bg-1), var(--bg-1));
    box-shadow: var(--shadow-medium);
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }
  header {
    display: flex;
    justify-content: flex-end;
    padding: var(--space-2);
    padding-bottom: 0;
  }
  .dialog-body {
    padding: var(--space-4);
  }
</style>
