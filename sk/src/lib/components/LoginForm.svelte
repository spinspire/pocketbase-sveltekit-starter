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
let activeTab = signup ? "SignUp" : "SignIn"; // Add this line

async function submit() {
  if (create) {
    try {
      await coll.create({ email, name, password, passwordConfirm });
      // Handle success (e.g., navigate to another page or show a success message)
    } catch (error) {
      console.error("Error creating user:", error);
      // Handle error (e.g., show an error message)
    }
  } else if (admin) {
    try {
      await client.admins.authWithPassword(email, password);
      // Handle admin auth success
    } catch (error) {
      console.error("Admin authentication error:", error);
      // Handle error
    }
  } else {
    try {
      await coll.authWithPassword(email, password);
      // Handle user auth success
    } catch (error) {
      console.error("User authentication error:", error);
      // Handle error
    }
  }
}
</script>

<form on:submit|preventDefault={submit} class="form-control w-full max-w-xs">
  {#if passwordLogin}
    <div class="tabs">
      <button
        class="tab-bordered tab {activeTab === 'SignIn' ? 'tab-active' : ''}"
        on:click={() => (activeTab = 'SignIn', signup = false)}
        on:keydown={(event) => {
          if (event.key === 'Enter') {
            activeTab = 'SignIn';
            signup = false;
          }
        }}
        type="button"
        aria-label="Sign In"
      >
        Sign In
      </button>
      <button
        class="tab-bordered tab {activeTab === 'SignUp' ? 'tab-active' : ''}"
        on:click={() => (activeTab = 'SignUp', signup = true)}
        type="button"
      >
        Sign Up
      </button>
    </div>

    {#if activeTab === 'SignIn'}
      <div class="form-control">
        <label class="label" for="email-input">
          <span class="label-text">Email</span>
        </label>
        <input
          class="input input-bordered"
          bind:value={email}
          required
          type="text"
          placeholder="email"
          id="email-input"
        />
        <input
          class="input input-bordered"
          bind:value={email}
          required
          type="text"
          placeholder="email"
        />
        <label class="label" for="password-input">
          <span class="label-text">Password</span>
        </label>
        <input
          class="input input-bordered"
          bind:value={password}
          required
          type="password"
          placeholder="password"
          id="password-input"
        />
        <input
          class="input input-bordered"
          bind:value={password}
          required
          type="password"
          placeholder="password"
        />
        <label class="label cursor-pointer">
          <span class="label-text">Admin</span>
          <input type="checkbox" class="checkbox" bind:checked={admin} />
        </label>
        <button
          class="btn btn-primary"
          type="submit"
          on:click={() => (create = false)}>Sign In</button
        >
      </div>
    {:else if activeTab === 'SignUp'}
      <div class="form-control">
        <input
          class="input input-bordered"
          bind:value={email}
          required
          type="text"
          placeholder="email"
        />
        <input
          class="input input-bordered"
          bind:value={password}
          required
          type="password"
          placeholder="password"
        />
        <input
          class="input input-bordered"
          bind:value={passwordConfirm}
          required
          type="password"
          placeholder="confirm password"
        />
        <input
          class="input input-bordered"
          bind:value={name}
          required
          type="text"
          placeholder="name / label"
        />
        <input type="hidden" name="register" value={true} />
        <button
          class="btn btn-primary"
          type="submit"
          on:click={() => (create = true)}>Sign Up</button
        >
      </div>
    {/if}
  {/if}

  {#await coll.listAuthMethods({ $autoCancel: false }) then methods}
    <div class="pt-4">
      {#each methods.authProviders as p}
        <button
          class="btn btn-outline"
          type="button"
          on:click={() => providerLogin(p, coll)}>Sign-in with {p.name}</button
        >
      {/each}
    </div>
  {:catch}
    <!-- pocketbase not working -->
  {/await}
</form>
