<script lang="ts">
  const {
    authCollection = "users",
    passwordLogin = true,
    signupAllowed = true,
  } = $props();
  import { client, providerLogin, webauthnLogin } from "../pocketbase";
  const coll = $derived(client.collection(authCollection));

  const form = $state({
    email: "",
    name: "",
    password: "",
    passwordConfirm: "",
    admin: false,
    passkey: false,
  });
  let signup = false;
  let active = $state("SignIn");

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    if (signup) {
      await coll.create({
        ...form,
        metadata: {
          foo: "bar",
        },
      });
    }
    if (form.passkey) {
      const { email } = form;
      await webauthnLogin(email);
      return;
    }
    // signin
    if (form.admin) {
      await client
        .collection("_superusers")
        .authWithPassword(form.email, form.password);
    } else {
      await coll.authWithPassword(form.email, form.password);
    }
  }
</script>

{#snippet signin()}
  <label>
    <input bind:value={form.email} required type="text" placeholder="" />
    <span>Email / Username</span>
  </label>
  {#if !form.passkey}
    <label>
      <input
        bind:value={form.password}
        required
        type="password"
        placeholder=""
      />
      <span>Password</span>
    </label>
  {/if}
  <label title="sign-in as admin">
    <input type="checkbox" bind:checked={form.admin} />Admin
  </label>
  <label title="sign-in using passkey">
    <input type="checkbox" bind:checked={form.passkey} />Sign-in with passkey
  </label>
  <button type="submit" onclick={() => (signup = false)}>Sign In</button>
{/snippet}

<form onsubmit={submit}>
  {#if passwordLogin}
    {#if signupAllowed}
      <nav class="tabs" data-variant="underline">
        <button
          type="button"
          class="tab"
          data-active={active === "SignIn" || undefined}
          onclick={() => (active = "SignIn")}
        >Sign In</button>
        <button
          type="button"
          class="tab"
          data-active={active === "SignUp" || undefined}
          onclick={() => (active = "SignUp")}
        >Sign Up</button>
      </nav>
      {#if active === "SignIn"}
        {@render signin()}
      {:else}
        <label>
          <input
            bind:value={form.email}
            required
            type="text"
            placeholder=""
          />
          <span>Email</span>
        </label>
        <label>
          <input
            bind:value={form.password}
            required
            type="password"
            placeholder=""
          />
          <span>Password</span>
        </label>
        <label>
          <input
            bind:value={form.passwordConfirm}
            required
            type="password"
            placeholder=""
          />
          <span>Confirm Password</span>
        </label>
        <label>
          <input bind:value={form.name} required type="text" placeholder="" />
          <span>Name / Label</span>
        </label>
        <input type="hidden" name="register" value={true} />
        <button type="submit" onclick={() => (signup = true)}>Sign Up</button>
      {/if}
    {:else}
      <h2>Sign In</h2>
      {@render signin()}
    {/if}
  {/if}
  {#await coll.listAuthMethods({ $autoCancel: false }) then methods}
    {#each methods.authProviders as p}
      <button type="button" onclick={() => providerLogin(p, coll)}
        >Sign-in with {p.name}</button
      >
    {/each}
  {:catch}
    <!-- pocketbase not working -->
  {/await}
</form>

<style>
  form :global(label) {
    display: block;
  }
  .tabs {
    display: flex;
    gap: 0;
    border-bottom: 2px solid var(--border);
    margin-block-end: var(--space-4);
  }
  .tab {
    padding: var(--space-3) var(--space-4);
    color: light-dark(var(--color-2), var(--color-2));
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
  }
  .tab:hover {
    color: light-dark(var(--color-1), var(--color-1));
  }
  .tab[data-active] {
    color: var(--primary);
    border-bottom-color: var(--primary);
    font-weight: 600;
  }
</style>
