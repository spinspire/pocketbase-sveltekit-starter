<script lang="ts">
  import { metadata } from "$lib/app/stores";
  import { currentUser } from "$lib/pocketbase";
  $metadata.title = "Pollamin - AI made Simple";
</script>

<samp> Your API key: {$currentUser?.apikey} </samp>

<ul>
  <li><a href="/hello">Hello - read this first!</a></li>
  <li><a href="/davinci">GPT3 - DaVinci</a></li>
</ul>
