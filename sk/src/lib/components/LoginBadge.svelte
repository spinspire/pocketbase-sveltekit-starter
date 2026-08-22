<script lang="ts">
  import { onDestroy } from "svelte";
  import { authModel, client, webauthnRegister } from "../pocketbase";
  import { alerts } from "$lib/alerts";
  import Alerts from "./Alerts.svelte";
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
    {#snippet trigger(show: () => void)}
      <button class="ghost badge" onclick={show}>
        {#if $authModel.avatar}
          <img
            src={client.getFileUrl($authModel, $authModel.avatar)}
            alt="profile pic"
          />
        {/if}
        <span>{$authModel?.name || $authModel?.username || $authModel?.email}</span>
      </button>
    {/snippet}
    <div class="wrapper">
      <div class="badge">
        {#if $authModel.avatar}
          <img
            src={client.getFileUrl($authModel, $authModel.avatar)}
            alt="profile pic"
          />
        {/if}
        <span>{$authModel?.name || $authModel?.username || $authModel?.email}</span>
      </div>
      <button onclick={() => webauthnRegister($authModel?.email)}>
        <i class="bi bi-key"></i> Register Passkey
      </button>
      <button class="outline" onclick={logout}>
        <i class="bi bi-box-arrow-right"></i> Sign Out
      </button>
    </div>
  </Dialog>
{:else}
  <Dialog>
    {#snippet trigger(show: () => void)}
      <button onclick={show}>
        {signupAllowed ? "Sign In / Sign Up" : "Sign In"}
      </button>
    {/snippet}
    <Alerts />
    <LoginForm {signupAllowed} />
  </Dialog>
{/if}

<style>
  .badge {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-3);
  }
  .badge img {
    height: 2em;
    width: 2em;
    border-radius: 50%;
    object-fit: cover;
  }
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .wrapper .badge {
    justify-content: center;
    padding-block-end: var(--space-3);
    border-bottom: 1px solid var(--border);
  }
</style>
