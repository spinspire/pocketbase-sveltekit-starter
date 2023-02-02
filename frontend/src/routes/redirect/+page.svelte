<script lang="ts">
  import { getRedirectUrl, pbClient } from "$lib/pocketbase";

  function authWithGoogle() {
    const redirectUrl = getRedirectUrl();
    const params = new URL(window.location as any).searchParams;

    // Retreive googleProvider instance in localStorage!
    const googleProvider = JSON.parse(
      localStorage.getItem("googleProvider") as any
    );

    // compare the redirect's state param and the stored provider's one
    if (googleProvider.state !== params.get("state")) {
      throw "Error: Google Auth Provider: State does not match!";
    }

    pbClient
      .collection("users")
      .authWithOAuth2(
        googleProvider.name,
        params.get("code") || "",
        googleProvider.codeVerifier,
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

  authWithGoogle();
</script>

<h1>REDIRECT PAGE</h1>
