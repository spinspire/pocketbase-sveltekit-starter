<script lang="ts">
import type { Record, Admin } from "pocketbase";
import { onDestroy } from "svelte";
import { authModel, client } from "../pocketbase";
import { alerts } from "./Alerts.svelte";
import Dialog from "./Dialog.svelte";
import LoginForm from "./LoginForm.svelte";
    import { goto } from "$app/navigation";

let isDialogOpen = false;

async function logout() {  
  goto("/");
  client.authStore.clear();
  isDialogOpen = false;
}

function getFileUrl(authModel: Record | Admin, avatar: any) {
  const baseUrl =
    import.meta.env.VITE_APP_BASE_URL + "/api/files/_pb_users_auth_";
  const userId = authModel.id;
  const fileName = avatar;
  const token = client.authStore.token;

  return `${baseUrl}/${userId}/${fileName}?token=${token}`;
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
  <button class="badge" on:click={() => (isDialogOpen = true)}>
    {#if $authModel.avatar}
      <ul class="inline-block">
        <li>{$authModel?.name || $authModel?.username || $authModel?.email}</li>
      </ul>
      <!-- <img class="inline-block h-10 w-10 rounded-md mx-4"  src={getFileUrl($authModel, $authModel.avatar)} alt="profile pic" /> -->
    {/if}
  </button>

  <Dialog bind:open={isDialogOpen}>
    <div class="wrapper">
      <div class="badge">
        <samp
          >{$authModel?.name ?? $authModel?.username ?? $authModel?.email}</samp
        >
        {#if $authModel.avatar}
          <img
            class="mx-4 inline-block h-10 w-10 rounded-md"
            src={getFileUrl($authModel, $authModel.avatar)}
            alt="profile pic"
          />
        {/if}
      </div>
      <button on:click={logout}>Sign Out</button>
    </div>
  </Dialog>
{:else}
  <button class="btn btn-primary" on:click={() => (isDialogOpen = true)}
    >Sign In</button
  >

  <Dialog bind:open={isDialogOpen}>
    <LoginForm />
  </Dialog>
{/if}

<style lang="scss">
/* ... */
</style>
