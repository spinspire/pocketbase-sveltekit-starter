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
    <summary>Login</summary>
    <div class="wrapper">
      <form on:submit|preventDefault={submit}>
        <input
          bind:value={user.email}
          required
          type="email"
          placeholder="email"
        />
        <input
          bind:value={user.password}
          required
          type="password"
          placeholder="password"
        />
        {#if user.register}
          <input
            bind:value={user.passwordConfirm}
            required
            type="password"
            placeholder="confirm password"
          />
        {/if}
        <div class="inline">
          <label
            ><span>Register</span>
            <input type="checkbox" bind:checked={user.register} />
          </label>
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  </details>
{/if}

<style>
  .wrapper {
    position: relative;
  }
  form {
    position: absolute;
    top: 1rem;
    right: 0;
    background-color: var(--color-bg-secondary);
  }
  button {
    padding: 0 1rem;
  }
  div.inline > * {
    display: inline-block;
  }
  details {
    margin: 0 0;
  }
  summary {
    color: var(--color-link);
    list-style-type: none;
  }
</style>
