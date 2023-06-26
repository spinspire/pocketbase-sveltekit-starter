<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let files: FileList;
  export let accept = ".*";
  let multiple = true;
  const dispatch = createEventDispatcher();
</script>

<label class="file">
  <div><slot>Drag/drop files here.</slot></div>
  <input type="file" {multiple} bind:files on:change={(e) => dispatch("change", files)} {accept} />
</label>

<style lang="scss">
  label.file {
    cursor: pointer;
    border: dashed 2px gray;
    padding: 1em;
    position: relative;
    display: flex;
    justify-content: center;
    input[type="file"] {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      opacity: 0;
      padding: 0;
      margin: 0;
      cursor: pointer;
    }
  }
</style>
