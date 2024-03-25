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

<form
  on:submit|preventDefault={submit}
  class="rounded-box bg-base-200 flex max-w-md flex-col gap-4 p-6"
>
  {#if passwordLogin}
    <h1 class="self-center text-3xl font-bold">
      {activeTab === 'SignIn' ? 'Log in' : 'Create an account'}
    </h1>

    <div class="tabs self-center">
      <button
        class="tab tab-bordered {activeTab === 'SignIn' ? 'tab-active' : ''}"
        on:click={() => (activeTab = 'SignIn', signup = false)}
        on:keydown={(event) => {
          if (event.key === 'Enter') {
            activeTab = 'SignIn';
            signup = false;
          }
        }}
        aria-label="Log in"
        type="button"
      >
        Log in
      </button>
      <button
        class="tab tab-bordered {activeTab === 'SignUp' ? 'tab-active' : ''}"
        on:click={() => (activeTab = 'SignUp', signup = true)}
        on:keydown={(event) => {
          if (event.key === 'Enter') {
            activeTab = 'SignUp';
            signup = true;
          }
        }}
        aria-label="Sign up"
      >
        Sign up
      </button>
    </div>

    {#await coll.listAuthMethods({ $autoCancel: false }) then methods}
      <div class="space-y-2">
        {#each methods.authProviders as p}
          <button
            class="btn btn-neutral w-full"
            type="button"
            on:click={() => providerLogin(p, coll)}
          >
            <i class="fa-brands fa-google text-primary mr-2"></i>
            {activeTab === 'SignIn' ? 'Log in' : 'Sign up'} with {p.name}
          </button>
        {/each}
      </div>
    {:catch}
      <!-- pocketbase not working -->
    {/await}

    <div class="divider">OR</div>

    {#if activeTab === 'SignIn'}
      <label class="form-control">
        <div class="label">
          <span class="label-text">Email</span>
        </div>
        <input
          class="input input-bordered"
          bind:value={email}
          required
          type="email"
          placeholder="email"
          id="email-input"
          autocomplete="email"
        />
      </label>

      <label class="form-control">
        <div class="label">
          <span class="label-text">Password</span>
        </div>
        <input
          class="input input-bordered"
          bind:value={password}
          required
          type="password"
          placeholder="password"
          id="password-input"
          autocomplete="current-password"
        />
      </label>

      <div class="form-control">
        <label class="label cursor-pointer gap-2 self-start">
          <input type="checkbox" class="checkbox" bind:checked={admin} />
          <span class="label-text">Admin</span>
        </label>
      </div>

      <button
        class="btn btn-primary"
        type="submit"
        on:click={() => (create = false)}
      >
        Log in
      </button>
    {:else if activeTab === 'SignUp'}
      <label class="form-control">
        <div class="label">
          <span class="label-text">Email</span>
        </div>
        <input
          class="input input-bordered"
          bind:value={email}
          required
          type="text"
          placeholder="email"
        />
      </label>

      <label class="form-control">
        <div class="label">
          <span class="label-text">Password</span>
        </div>
        <input
          class="input input-bordered"
          bind:value={password}
          required
          type="password"
          placeholder="password"
        />
      </label>

      <label class="form-control">
        <div class="label">
          <span class="label-text">Confirm password</span>
        </div>
        <input
          class="input input-bordered"
          bind:value={passwordConfirm}
          required
          type="password"
          placeholder="confirm password"
        />
      </label>

      <label class="form-control">
        <div class="label">
          <span class="label-text">Name / Label</span>
        </div>
        <input
          class="input input-bordered"
          bind:value={name}
          required
          type="text"
          placeholder="name / label"
        />
      </label>

      <input type="hidden" name="register" value={true} />

      <button
        class="btn btn-primary"
        type="submit"
        on:click={() => (create = true)}
      >
        Sign up
      </button>
    {/if}

    {#if errorMessage}
      <div class="alert alert-error">
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
      <div class="alert alert-success">
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
</form>
