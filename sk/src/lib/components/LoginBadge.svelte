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
      <button class="badge" onclick={show}>
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
      <div class="badge">
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
      <button onclick={logout}>Sign Out</button>
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

<style lang="scss">
  .badge {
    padding: 0;
    background-color: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    > img {
      height: 2em;
      width: 2em;
      border-radius: 50%;
    }
    > samp {
      display: inline-block !important;
      -moz-border-radius: 20px !important;
      -webkit-border-radius: 20px !important;
      -khtml-border-radius: 20px !important;
      border-radius: 20px !important;
      padding: 0.5rem !important;
      text-align: center !important;
      line-height: 1.5rem !important;
    }
  }
  .wrapper {
    display: flex;
    flex-direction: column;
  }
</style>
