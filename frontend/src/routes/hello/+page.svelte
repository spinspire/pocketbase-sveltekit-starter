<script lang="ts">
  import type { PageData } from "./$types";
  export let data: PageData;
</script>

<h1>Welcome to Pollamin!</h1>
<p>{@html data.output}</p>
