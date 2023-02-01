<script lang="ts">
  import { pbClient, googleAuth } from "$lib/pocketbase";
  import { PUBLIC_POCKETBASE_URL } from "$env/static/public";

  // Svelte Magic: only call redirectToGoogle
  // when googleAuth becomes truthy
  $: $googleAuth && redirectToGoogle();

  function redirectToGoogle() {
    const redirectUrl = window.location.href + "/redirect";
    const params = new URL(window.location as any).searchParams;
    console.log("SEARCH PARAMS:", params);

    pbClient
      .collection("users")
      .authWithOAuth2(
        $googleAuth.name,
        params.get("code") || "",
        $googleAuth.codeVerifier,
        redirectUrl
      )
      .then((authData) => {
        console.log("AUTH SUCCESS:", authData);
      })
      .catch((err) => {
        console.log("AUTH FAILURE:", err);
      });
  }
</script>

<h1>REDIRECT PAGE</h1>
