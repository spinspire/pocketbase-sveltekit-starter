<script lang="ts">
  import { currentUser, login, logout } from "$lib/pocketbase";
  import { alertOnFailure } from "$lib/pocketbase/ui";
  const DEFAULTS = {
    email: "",
    password: "",
    passwordConfirm: "",
    register: false,
  };
  let user = { ...DEFAULTS };
  let open: boolean;

  async function submit() {
    await alertOnFailure(async function () {
      await login(user.email, user.password, user.register, user);
      user = { ...DEFAULTS };
      open = false;
    });
  }
  function clickLogout() {
    logout();
    open = false;
  }
</script>

<details bind:open>
  {#if $currentUser}
    <summary>
      <samp>{$currentUser?.email}</samp>
    </summary>
    <div class="wrapper">
      <button on:click={clickLogout}>Logout</button>
    </div>
  {:else}
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
  {/if}
</details>

<style lang="scss">
  details {
    margin: 0;
    summary {
      display: flex;
    }
    &[open] {
      padding-bottom: 0;
      summary {
        margin-bottom: 0;
      }
    }
    .wrapper {
      position: absolute;
      padding: 10px;
      background-color: var(--background-alt);
    }
  }
</style>
