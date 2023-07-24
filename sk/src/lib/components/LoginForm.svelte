<script lang="ts">
  export let authCollection = "users";
  export let passwordLogin = true;
  export let signup = true;
  import { client, providerLogin } from "../pocketbase";
  import Tab from "./Tab.svelte";
  import TabContent from "./TabContent.svelte";
  import TabGroup from "./TabGroup.svelte";
  const coll = client.collection(authCollection);

  let email: string;
  let name: string;
  let password: string;
  let passwordConfirm: string;
  let create = false;
  let admin = false;

  async function submit() {
    if (create) {
      await coll.create({ email, name, password, passwordConfirm });
    }
    if (admin) {
      await client.admins.authWithPassword(email, password);
    } else {
      await coll.authWithPassword(email, password);
    }
  }
</script>

<form on:submit|preventDefault={submit}>
  {#if passwordLogin}
    {#if signup}
      <TabGroup active="SignIn">
        <div slot="tabs">
          <Tab key="SignIn">Sign In</Tab>
          <Tab key="SignUp">Sign Up</Tab>
        </div>
        <TabContent key="SignIn">
          <input bind:value={email} required type="text" placeholder="email" />
          <input
            bind:value={password}
            required
            type="password"
            placeholder="password"
          />
          <label title="sign-in as admin"
            ><input type="checkbox" bind:checked={admin} />Admin</label
          >
          <button type="submit" on:click={() => (create = false)}
            >Sign In</button
          >
        </TabContent>

        <TabContent key="SignUp">
          <input bind:value={email} required type="text" placeholder="email" />
          <input
            bind:value={password}
            required
            type="password"
            placeholder="password"
          />
          <input
            bind:value={passwordConfirm}
            required
            type="password"
            placeholder="confirm password"
          />
          <input
            bind:value={name}
            required
            type="text"
            placeholder="name / label"
          />
          <input type="hidden" name="register" value={true} />
          <button type="submit" on:click={() => (create = true)}>Sign Up</button
          >
        </TabContent>
      </TabGroup>
    {:else}
      <h2>Sign In</h2>
      <input bind:value={email} required type="text" placeholder="email" />
      <input
        bind:value={password}
        required
        type="password"
        placeholder="password"
      />
      <button type="submit" on:click={() => (create = false)}>Sign In</button>
    {/if}
  {/if}
  {#await coll.listAuthMethods({ $autoCancel: false }) then methods}
    {#each methods.authProviders as p}
      <button type="button" on:click={() => providerLogin(p, coll)}
        >Sign-in with {p.name}</button
      >
    {/each}
  {:catch}
    <!-- pocketbase not working -->
  {/await}
</form>
