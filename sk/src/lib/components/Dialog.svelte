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
    <button class="ghost icon" aria-label="Close">
      <i class="bi bi-x-lg"></i>
    </button>
  </form>
  {@render children()}
</dialog>

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
  dialog > :not(form) {
    padding: var(--space-4);
  }
</style>
