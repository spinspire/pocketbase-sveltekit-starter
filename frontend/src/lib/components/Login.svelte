<script lang="ts">
  import { pbClient, currentUser, login, logout } from "$lib/pocketbase";
  import { alertOnFailure } from "$lib/pocketbase/ui";
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

{#if $currentUser}
  <button on:click={() => console.log({ $currentUser })}>
    <samp>{$currentUser?.email}</samp>
  </button>
  <ul>
    <li><button on:click={logout}>Logout</button></li>
  </ul>
{:else}
  <details>
    <summary>Login with Google</summary>
    <div class="wrapper">Coming Soon</div>
  </details>
{/if}

<style>
  .wrapper {
    position: relative;
  }
  /* form {
    position: absolute;
    top: 1rem;
    right: 0;
    background-color: var(--color-bg-secondary);
  } */
  button {
    padding: 0 1rem;
  }
  /* div.inline > * {
    display: inline-block;
  } */
  details {
    margin: 0 0;
  }
  summary {
    color: var(--color-link);
    list-style-type: none;
  }
</style>
