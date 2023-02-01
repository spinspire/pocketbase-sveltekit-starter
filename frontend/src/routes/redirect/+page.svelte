<script lang="ts">
  import { getRedirectUrl, pbClient, googleAuth } from "$lib/pocketbase";

  // Svelte Magic: only call redirectToGoogle
  // when googleAuth becomes truthy
  $: $googleAuth && authWithGoogle();

  function authWithGoogle() {
    const redirectUrl = getRedirectUrl();
    const params = new URL(window.location as any).searchParams;

    console.log("Calling authWithOAuth2");

    pbClient
      .collection("users")
      .authWithOAuth2(
        $googleAuth.name,
        params.get("code") || "",
        $googleAuth.codeVerifier,
        redirectUrl,
        {
          emailVisibility: true,
        }
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
