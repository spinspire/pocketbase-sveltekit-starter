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
  function close(e: any) {
    function inClientRect(element: Element, event: MouseEvent) {
      const { left, right, top, bottom } = element.getBoundingClientRect();
      return (
        event.clientX >= left &&
        event.clientX <= right &&
        event.clientY >= top &&
        event.clientY <= bottom
      );
    }
    // if the user clicks on the dialog's backdrop
    if (e?.target === dialog && !inClientRect(dialog, e)) {
      dialog.close();
    }
  }
  $effect(() => {
    dialog.addEventListener("click", close);
  });
</script>

{#snippet _trigger(show)}
  <button onclick={show}>Open Dialog</button>
{/snippet}

{@render trigger(show)}
<dialog bind:this={dialog}>
  {@render children()}
</dialog>
