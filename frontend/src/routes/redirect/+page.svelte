<script lang="ts">
  import { pbClient, currentUser, login, logout } from "$lib/pocketbase";
  import { PUBLIC_POCKETBASE_URL } from "$env/static/public";

  async function setupGoogleAuth() {
    const authList = await pbClient.collection("users").listAuthMethods();
    // Assume we only use Google for Oauth2!
    const googleAuth = authList.authProviders[0];
    console.log(googleAuth);

    const redirectUrl = PUBLIC_POCKETBASE_URL + "/hello";
    const params = new URL(window.location as any).searchParams;

    pbClient
      .collection("users")
      .authWithOAuth2(
        googleAuth.name,
        params.get("code") || "",
        googleAuth.codeVerifier,
        redirectUrl
      )
      .then((authData) => {
        console.log("AUTH SUCCESS:", authData);
      })
      .catch((err) => {
        console.log("AUTH FAILURE:", err);
      });
  }

  setupGoogleAuth();
</script>

<h1>REDIRECT PAGE</h1>
