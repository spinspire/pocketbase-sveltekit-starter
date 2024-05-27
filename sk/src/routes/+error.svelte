<script lang="ts">
  import { page } from "$app/stores";
</script>

<pre>{$page.status} - {$page.error?.message}</pre>
