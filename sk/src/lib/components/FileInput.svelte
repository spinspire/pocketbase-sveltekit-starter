<script lang="ts">
  let {
    fileInput = $bindable(),
    pasteFile = false,
    multiple = false,
  }: {
    fileInput?: HTMLInputElement;
    pasteFile?: boolean;
    multiple?: boolean;
  } = $props();

  function onpaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file && fileInput) {
          const dt = new DataTransfer();
          dt.items.add(file);
          fileInput.files = dt.files;
          fileInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<label onpaste={pasteFile ? onpaste : undefined}>
  <input type="file" bind:this={fileInput} {multiple} />
  <slot />
</label>

<style>
  label {
    cursor: pointer;
    border: dashed 2px light-dark(#999, #666);
    padding: 1em;
    position: relative;
    display: flex;
    justify-content: center;
    border-radius: var(--radius-medium);
    transition: border-color 0.15s;
  }
  label:hover {
    border-color: var(--primary);
  }
  label > input[type="file"] {
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
</style>
