<script lang="ts">
  export let open: boolean;

  function handleClose() {
    open = false;
  }
</script>

<dialog class="modal" {open} on:close={handleClose}>
  <div class="modal-box">
    <slot />    
    <div class="modal-action">
      <button class="btn btn-primary" on:click={handleClose}>Close</button>
    </div>
  </div>
</dialog>

<style>
  /* Add any necessary styles */
</style>