<script lang="ts">
  import {
    currentUser,
    logout,
    getRedirectUrl,
    getGoogleAuthProviderInstance,
  } from "$lib/pocketbase";
  import { alertOnFailure } from "$lib/pocketbase/ui";

  async function loginWithGoogle() {
    const googleProvider = await getGoogleAuthProviderInstance();
    console.log("Logging in with " + googleProvider.name);

    // Must save googleProvider instance in localStorage!
    console.log("Setting GoogleProvider into localStorage");
    localStorage.setItem("googleProvider", JSON.stringify(googleProvider));

    // Initiate the login by browsing to Oauth2 endpoint at Google
    window.location.href = googleProvider.authUrl + getRedirectUrl();
  }
</script>

{#if $currentUser}
  <button>
    <!-- <div><samp>{$currentUser?.email}</samp></div> -->
    {#if $currentUser?.avatarurl}
      <div><img alt="User Avatar" src={$currentUser?.avatarurl} /></div>
    {/if}

    <div><samp>{$currentUser?.name}</samp></div>
  </button>
  <ul>
    <li><button on:click={logout}>Logout</button></li>
  </ul>
{:else}
  <details>
    <summary>Login with Google</summary>
    <button on:click={loginWithGoogle}>Login</button>
  </details>
{/if}

<style>
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
