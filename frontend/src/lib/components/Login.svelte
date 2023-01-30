<script lang="ts">
  import { client, currentUser, login, logout } from "$lib/pocketbase";
  import { alertOnFailure } from "$lib/pocketbase/ui";
  const DEFAULTS = {
    email: "",
    password: "",
    passwordConfirm: "",
    register: false,
  };
  let user = { ...DEFAULTS };

  async function submit() {
    await alertOnFailure(async function () {
      await login(user.email, user.password, user.register, user);
      user = { ...DEFAULTS };
    });
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
