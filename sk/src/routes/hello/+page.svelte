<script lang="ts">
  import type { PageData } from "./$types";
  export let data: PageData;
</script>

<h1>Hello!</h1>
<p>Got the following API response from the backend server</p>
<pre>{JSON.stringify(data)}</pre>
