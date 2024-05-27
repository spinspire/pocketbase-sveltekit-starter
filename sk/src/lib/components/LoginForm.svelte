<script lang="ts">
  const {
    authCollection = "users",
    passwordLogin = true,
    signupAllowed = true,
  } = $props();
  import { client, providerLogin } from "../pocketbase";
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
  });
  let signup = false;

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    if (signup) {
      await coll.create({ ...form });
    }
    // signin
    if (form.admin) {
      await client.admins.authWithPassword(form.email, form.password);
    } else {
      await coll.authWithPassword(form.email, form.password);
    }
  }
  let active = $state("SignIn");
</script>

{#snippet signin()}
  <input bind:value={form.email} required type="text" placeholder="email" />
  <input
    bind:value={form.password}
    required
    type="password"
    placeholder="password"
  />
  <label title="sign-in as admin">
    <input type="checkbox" bind:checked={form.admin} />Admin
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
