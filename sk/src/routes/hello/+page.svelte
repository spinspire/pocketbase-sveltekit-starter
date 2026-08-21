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

<section>
  <p>API response from the backend server:</p>
  <pre class="card">{JSON.stringify(data, null, 2)}</pre>
</section>

<form method="post" onsubmit={sendEmail}>
  <button type="submit">Send me an email</button>
</form>
