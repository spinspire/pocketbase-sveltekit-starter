<script lang="ts">
  export let authCollection = "users";
  export let passwordLogin = true;
  export let register = false;
  import { client, providerLogin } from "../pocketbase";
  const coll = client.collection(authCollection);

  let email: string;
  let name: string;
  let password: string;
  let passwordConfirm: string;

  async function submit() {
    if (register) {
      await coll.create({ email, name, password, passwordConfirm });
    }
    await coll.authWithPassword(email, password);
  }
</script>

<form on:submit|preventDefault={submit}>
  {#if passwordLogin}
    <input bind:value={email} required type="text" placeholder="email" />
    <input
      bind:value={password}
      required
      type="password"
      placeholder="password"
    />
    <div class="inline">
      <label
        ><span>Register</span>
        <input type="checkbox" bind:checked={register} />
      </label>
    </div>
    {#if register}
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
    {/if}
    <button type="submit">{register ? "Sign Up" : "Sign In"}</button>
  {/if}
  {#await coll.listAuthMethods({ $autoCancel: false }) then methods}
    {#each methods.authProviders as p}
      <button type="button" on:click={() => providerLogin(p, coll)}
        >Login with {p.name}</button
      >
    {/each}
  {:catch}
    <!-- pocketbase not working -->
  {/await}
</form>
