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
  <label data-field>
    Email / Username
    <input bind:value={form.email} required type="text" placeholder="Enter email or username" />
  </label>
  {#if !form.passkey}
    <label data-field>
      Password
      <input
        bind:value={form.password}
        required
        type="password"
        placeholder="Enter password"
      />
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
      <div role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={active === "SignIn" || undefined}
          onclick={() => (active = "SignIn")}
        >Sign In</button>
        <button
          type="button"
          role="tab"
          aria-selected={active === "SignUp" || undefined}
          onclick={() => (active = "SignUp")}
        >Sign Up</button>
      </div>
      {#if active === "SignIn"}
        {@render signin()}
      {:else}
        <label data-field>
          Email
          <input
            bind:value={form.email}
            required
            type="text"
            placeholder="Enter email"
          />
        </label>
        <label data-field>
          Password
          <input
            bind:value={form.password}
            required
            type="password"
            placeholder="Enter password"
          />
        </label>
        <label data-field>
          Confirm Password
          <input
            bind:value={form.passwordConfirm}
            required
            type="password"
            placeholder="Confirm password"
          />
        </label>
        <label data-field>
          Name / Label
          <input bind:value={form.name} required type="text" placeholder="Your name" />
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
    {#each methods.oauth2.providers as p}
      <button type="button" onclick={() => providerLogin(p, coll)}
        >Sign-in with {p.name}</button
      >
    {/each}
  {:catch}
    <!-- pocketbase not working -->
  {/await}
</form>
