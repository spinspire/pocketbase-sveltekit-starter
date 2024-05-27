<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    fileInput = $bindable<HTMLInputElement>(),
    pasteFile = false, // this component captures the paste event and data
    children = _children,
    ...props // any other props or attributes will be passed to the file input
  }: {
    fileInput?: HTMLInputElement;
    pasteFile?: boolean;
    children?: Snippet<[]>;
    [key: string]: any;
  } = $props();
  function onpaste(e: ClipboardEvent) {
    if (pasteFile && e.clipboardData?.files) {
      fileInput.files = e.clipboardData.files;
    }
  }
  $effect(() => {
    // listen for changes to the file input files
    fileInput?.addEventListener("change", () => (files = fileInput?.files));
  });
  let files: FileList | null = $state(null);
</script>

{#snippet _children()}
  <div class="files">
    {#each files || [] as file}
      <span>{file.name}</span>
    {:else}
      drag/drop files here
    {/each}
  </div>
{/snippet}

<!-- When someone pastes a file anywhere on body, send it to this component -->
<svelte:body {onpaste} />

<label class="file">
  <div>
    {@render children()}
  </div>
  <input bind:this={fileInput} type="file" {...props} />
</label>

<style lang="scss">
  label {
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
      opacity: 0; // make it transparent (invisible)
      padding: 0;
      margin: 0;
      cursor: pointer;
    }
  }
  .files > span {
    display: inline-block;
    margin-right: 0.5em;
    margin-bottom: 0.25em;
    padding: 0 0.5em;
    border: dotted 1px;
  }
</style>
