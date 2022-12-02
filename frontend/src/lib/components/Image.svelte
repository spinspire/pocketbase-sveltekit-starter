<script lang="ts">
  import { client } from "$lib/pocketbase";
  import type { Record } from "pocketbase";

  export let record: Record;
  export let file: string;
  export let thumb: string | undefined;

  let props: any;
  $: ({ record, file, thumb, ...props } = $$props);
  $: src = file
    ? client.getFileUrl(record, file, { thumb })
    : `https://via.placeholder.com/${thumb ?? "100x100"}`;
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<img {...props} {src} rel="noreferrer" />
