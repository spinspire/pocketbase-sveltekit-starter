<script lang="ts">
  import { client } from "$lib/pocketbase";
  import { alerts } from "./Alerts.svelte";
  const DEFAULTS = {
    email: "",
    password: "",
    passwordConfirm: "",
    register: false,
  };
  let user = { ...DEFAULTS },
    authStore = client.authStore;
  client.authStore.onChange(function () {
    authStore = client.authStore;
  });

  async function submit() {
    try {
      if (user.register) {
        await client.collection("users").create(user);
      }
      await client
        .collection("users")
        .authWithPassword(user.email, user.password);
      user = { ...DEFAULTS };
    } catch (e: any) {
      const { code, message, data } = e;
      alerts.error(message, 5000);
      console.error(e);
    }
  }
</script>

{#if authStore.isValid}
  <samp on:click={() => console.log({ authStore })}>
    {authStore.model?.email}
  </samp>
  <ul>
    <li><button on:click={() => authStore.clear()}>Logout</button></li>
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
