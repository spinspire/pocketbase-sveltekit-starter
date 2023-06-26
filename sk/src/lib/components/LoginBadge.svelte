<script lang="ts">
  import { onDestroy } from "svelte";
  import { authModel, client } from "../pocketbase";
  import { alerts } from "./Alerts.svelte";
  import Dialog from "./Dialog.svelte";
  import LoginForm from "./LoginForm.svelte";
  let register: false;
  async function logout() {
    client.authStore.clear();
  }
  const unsubscribe = client.authStore.onChange((token, model) => {
    if (model) {
      const { name, username } = model;
      alerts.success(`Signed in as ${name || username}`, 5000);
    } else {
      alerts.success(`Signed out`, 5000);
    }
  }, false);
  onDestroy(() => {
    unsubscribe();
  });
  $: console.log({ $authModel });
</script>

{#if $authModel}
  <Dialog>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="badge" slot="trigger">
      {#if $authModel.avatar}
        <img
          src={client.getFileUrl($authModel, $authModel.avatar)}
          alt="profile pic"
        />
      {/if}
      <samp
        >{$authModel?.name || $authModel?.username || $authModel?.email}</samp
      >
    </div>
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
      <button on:click={logout}>Sign Out</button>
    </div>
  </Dialog>
{:else}
  <Dialog>
    <button slot="trigger">Sign In</button>
    <h2><center>{register ? "Sign Up" : "Sign In"}</center></h2>
    <LoginForm bind:register />
  </Dialog>
{/if}

<style lang="scss">
  .badge {
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 5px;
    gap: 5px;
    > img {
      height: 2em;
      width: 2em;
      border-radius: 50%;
    }
  }
  .wrapper {
    display: flex;
    flex-direction: column;
  }
</style>
