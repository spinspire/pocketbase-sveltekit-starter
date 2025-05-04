<script lang="ts">
  import { metadata } from "$lib/metadata.js";
  import { client } from "$lib/pocketbase/index.js";

  let { data } = $props();
  $effect(() => {
    $metadata.title = $metadata.headline = "Hello Page";
  });
  async function sendEmail(e: SubmitEvent) {
    e.preventDefault();
    client.send("/api/sendmail", {
      method: "post",
    });
  }
</script>

<h1>Hello!</h1>
<p>Got the following API response from the backend server</p>
<pre>{JSON.stringify(data, null, 2)}</pre>

<form method="post" onsubmit={sendEmail}>
  <button type="submit">Send me an email</button>
</form>
