<script lang="ts">
export let authCollection = "users";
export let passwordLogin = true;
export let signup = true;
import { client, providerLogin } from "../pocketbase";
const coll = client.collection(authCollection);
let email: string;
let name: string;
let password: string;
let passwordConfirm: string;
let create = false;
let admin = false;
let activeTab = signup ? "SignUp" : "SignIn";
let errorMessage = "";
let successMessage = "";
async function submit() {
  if (create) {
    try {
      await coll.create({ email, name, password, passwordConfirm });
      successMessage = "User created successfully!";
      errorMessage = "";
    } catch (error) {
      console.error("Error creating user:", error);
      errorMessage = "Error creating user. Please try again.";
      successMessage = "";
    }
  } else if (admin) {
    try {
      await client.admins.authWithPassword(email, password);
      successMessage = "Admin authenticated successfully!";
      errorMessage = "";
    } catch (error) {
      console.error("Admin authentication error:", error);
      errorMessage =
        "Admin authentication failed. Please check your credentials.";
      successMessage = "";
    }
  } else {
    try {
      await coll.authWithPassword(email, password);
      successMessage = "User authenticated successfully!";
      errorMessage = "";
    } catch (error) {
      console.error("User authentication error:", error);
      errorMessage =
        "User authentication failed. Please check your credentials.";
      successMessage = "";
    }
  }
}
</script>

<form on:submit|preventDefault={submit} class="form-control w-full max-w-xs">
  {#if passwordLogin}
    <div class="tabs mb-4">
      <a
        class="tab tab-bordered {activeTab === 'SignIn' ? 'tab-active' : ''}"
        on:click={() => (activeTab = 'SignIn', signup = false)}
      >
        Sign In
      </a>
      <a
        class="tab tab-bordered {activeTab === 'SignUp' ? 'tab-active' : ''}"
        on:click={() => (activeTab = 'SignUp', signup = true)}
      >
        Sign Up
      </a>
    </div>

    {#if activeTab === 'SignIn'}
      <div class="form-control w-full max-w-xs space-y-4">
        <label class="label" for="email-input">
          <span class="label-text">Email</span>
        </label>
        <input
          class="input input-bordered w-full max-w-xs"
          bind:value={email}
          required
          type="email"
          placeholder="email"
          id="email-input"
          autocomplete="email"
        />

        <label class="label" for="password-input">
          <span class="label-text">Password</span>
        </label>
        <input
          class="input input-bordered w-full max-w-xs"
          bind:value={password}
          required
          type="password"
          placeholder="password"
          id="password-input"
          autocomplete="current-password"
        />

        <div class="flex items-center">
          <label class="label cursor-pointer">
            <span class="label-text mr-2">Admin</span>
            <input type="checkbox" class="checkbox" bind:checked={admin} />
          </label>
        </div>

        <button
          class="btn btn-primary mt-4 w-full max-w-xs"
          type="submit"
          on:click={() => (create = false)}
        >
          Sign In
        </button>
      </div>
    {:else if activeTab === 'SignUp'}
      <div class="form-control w-full max-w-xs space-y-4">
        <input
          class="input input-bordered w-full max-w-xs"
          bind:value={email}
          required
          type="text"
          placeholder="email"
        />

        <input
          class="input input-bordered w-full max-w-xs"
          bind:value={password}
          required
          type="password"
          placeholder="password"
        />

        <input
          class="input input-bordered w-full max-w-xs"
          bind:value={passwordConfirm}
          required
          type="password"
          placeholder="confirm password"
        />

        <input
          class="input input-bordered w-full max-w-xs"
          bind:value={name}
          required
          type="text"
          placeholder="name / label"
        />

        <input type="hidden" name="register" value={true} />

        <button
          class="btn btn-primary mt-4 w-full max-w-xs"
          type="submit"
          on:click={() => (create = true)}
        >
          Sign Up
        </button>
      </div>
    {/if}

    {#if errorMessage}
      <div class="alert alert-error mt-4">
        <div class="flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="mx-2 h-6 w-6 stroke-current"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            ></path>
          </svg>
          <label>{errorMessage}</label>
        </div>
      </div>
    {/if}

    {#if successMessage}
      <div class="alert alert-success mt-4">
        <div class="flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="mx-2 h-6 w-6 stroke-current"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            ></path>
          </svg>
          <label>{successMessage}</label>
        </div>
      </div>
    {/if}
  {/if}

  {#await coll.listAuthMethods({ $autoCancel: false }) then methods}
    <div class="space-y-2 pt-4">
      {#each methods.authProviders as p}
        <button
          class="btn btn-outline w-full max-w-xs"
          type="button"
          on:click={() => providerLogin(p, coll)}
        >
          Sign-in with {p.name}
        </button>
      {/each}
    </div>
  {:catch}
    <!-- pocketbase not working -->
  {/await}
</form>
