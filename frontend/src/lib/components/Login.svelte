<script lang="ts">
  import { pbClient, currentUser, googleAuth, logout } from "$lib/pocketbase";
  import { alertOnFailure } from "$lib/pocketbase/ui";

  function loginWithGoogle() {
    console.log("Logging in with " + $googleAuth.name);
    window.location.href = $googleAuth.authUrl + getRedirectUrl();
  }

  function getRedirectUrl() {
    return window.location.href + "redirect";
  }
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
    {#if googleAuth}
      <button on:click={loginWithGoogle}>Login</button>
    {/if}
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
