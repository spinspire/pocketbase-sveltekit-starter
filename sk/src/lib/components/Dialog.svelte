<script lang="ts">
  import type { Snippet } from "svelte";

  const {
    trigger = _trigger,
    children,
    footer,
  }: {
    trigger?: Snippet<[() => void]>;
    children: Snippet<[]>;
    footer?: Snippet<[]>;
  } = $props();
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
    <header>
      <button class="ghost icon" aria-label="Close" onclick={() => dialog.close()}>
        <i class="bi bi-x-lg"></i>
      </button>
    </header>
    <div>
      {@render children()}
    </div>
    {#if footer}
      <footer>
        {@render footer()}
      </footer>
    {/if}
  </form>
</dialog>
