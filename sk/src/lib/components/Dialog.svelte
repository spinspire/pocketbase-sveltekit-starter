<script lang="ts">
  let dialog: HTMLDialogElement;
  function close(e: any) {
    if (typeof e?.target?.close === "function") e.target.close();
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<span on:click={(e) => dialog.showModal()}>
  <slot name="trigger">
    <button>Open Dialog</button>
  </slot>
</span>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog bind:this={dialog} on:click={close}>
  <slot />
</dialog>

<style lang="scss">
  dialog {
    padding: 6rem 8rem;
  }
</style>
