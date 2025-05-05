<script lang="ts">
  import { onDestroy } from "svelte";
  import { authModel, client } from "../pocketbase";
  import Alerts, { alerts } from "./Alerts.svelte";
  import Dialog from "./Dialog.svelte";
  import LoginForm from "./LoginForm.svelte";
  const { signupAllowed = true } = $props();
  async function logout() {
    client.authStore.clear();
  }
  const unsubscribe = client.authStore.onChange((token, model) => {
    if (model) {
      const { name, username } = model;
      alerts.success(`Signed in as ${name || username || "Admin"}`, 5000);
    } else {
      alerts.success(`Signed out`, 5000);
    }
  }, false);
  onDestroy(() => {
    unsubscribe();
  });
</script>

{#if $authModel}
  <Dialog>
    {#snippet trigger(show)}
      <button onclick={show} class="border">
        {#if $authModel.avatar}
          <img
            src={client.getFileUrl($authModel, $authModel.avatar)}
            alt="profile pic"
          />
        {/if}
        <samp
          >{$authModel?.name || $authModel?.username || $authModel?.email}</samp
        >
      </button>
    {/snippet}
    <div class="wrapper">
      <div>
        {#if $authModel.avatar}
          <img
            src={client.getFileUrl($authModel, $authModel.avatar)}
            alt="profile pic"
          />
        {/if}
        <samp
          >{$authModel?.name ?? $authModel?.username ?? $authModel?.email}</samp
        >
      </div>
      <button onclick={logout} class="border">Sign Out</button>
    </div>
  </Dialog>
{:else}
  <Dialog>
    {#snippet trigger(show)}
      <button onclick={show}>
        {signupAllowed ? "Sign In / Sign Up" : "Sign In"}
      </button>
    {/snippet}
    <Alerts />
    <LoginForm {signupAllowed} />
  </Dialog>
{/if}
