<script lang="ts">
  import {
    getRedirectUrl,
    goBackHome,
    pbClient,
    updateUserFromGoogleAuth,
  } from "$lib/pocketbase";
  import { tick } from "svelte";

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

        tick().then(() => {
          updateUserFromGoogleAuth(authData);
          goBackHome();
        });
      })
      .catch((err) => {
        console.log("AUTH FAILURE:", err);
      });
  }

  authWithGoogle();
</script>

<h1>Google Login</h1>
<h2>If you stay on this page, then something went wrong.</h2>
<h2>Check your browser console.</h2>
