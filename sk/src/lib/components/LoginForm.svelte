<script lang="ts">
  const {
    authCollection = "users",
    passwordLogin = true,
    signupAllowed = true,
  } = $props();
  import { client, providerLogin, webauthnLogin } from "../pocketbase";
  import TabGroup from "./TabGroup.svelte";
  import Tab from "./Tab.svelte";
  import TabContent from "./TabContent.svelte";
  const coll = client.collection(authCollection);

  const form = $state({
    email: "",
    name: "",
    password: "",
    passwordConfirm: "",
    admin: false,
    passkey: false,
  });
  let signup = false;

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
  let active = $state("SignIn");
</script>

{#snippet signin()}
  <input
    bind:value={form.email}
    required
    type="text"
    placeholder="email/username"
  />
  {#if !form.passkey}
    <input
      bind:value={form.password}
      required
      type="password"
      placeholder="password"
    />
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
      <TabGroup bind:active>
        {#snippet tabs()}
          <Tab key="SignIn">Sign In</Tab>
          <Tab key="SignUp">Sign Up</Tab>
        {/snippet}
        <TabContent key="SignIn">
          {@render signin()}
        </TabContent>
        <TabContent key="SignUp">
          <input
            bind:value={form.email}
            required
            type="text"
            placeholder="email"
          />
          <input
            bind:value={form.password}
            required
            type="password"
            placeholder="password"
          />
          <input
            bind:value={form.passwordConfirm}
            required
            type="password"
            placeholder="confirm password"
          />
          <input
            bind:value={form.name}
            required
            type="text"
            placeholder="name / label"
          />
          <input type="hidden" name="register" value={true} />
          <button type="submit" onclick={() => (signup = true)}>Sign Up</button>
        </TabContent>
      </TabGroup>
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
