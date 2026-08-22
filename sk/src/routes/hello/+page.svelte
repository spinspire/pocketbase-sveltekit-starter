<script lang="ts">
  import { metadata } from "$lib/metadata.js";
  import { client } from "$lib/pocketbase/index.js";
  import { authModel } from "$lib/pocketbase";

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

{#if $authModel && data.hello}
  <section>
    <p>API response from the backend server:</p>
    <pre class="card">{JSON.stringify(data.hello, null, 2)}</pre>
  </section>

  <form method="post" onsubmit={sendEmail}>
    <button type="submit">Send me an email</button>
  </form>
{:else}
  <section>
    <p>This page requires authentication.</p>
    <p>Sign in to see the API response and send test emails.</p>
  </section>
{/if}
