<script lang="ts">
let dialog: HTMLDialogElement;
function close(e: any) {
  if (typeof e?.target?.close === "function") e.target.close();
}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->

<dialog bind:this={dialog}>
  <slot name="trigger" />
  <slot />
</dialog>

<style lang="scss">
dialog {
  padding: 6rem 8rem;
}
</style>
