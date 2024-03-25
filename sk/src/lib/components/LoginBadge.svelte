<script lang="ts">
import { onMount, onDestroy } from "svelte";
import { authModel, client } from "../pocketbase";
import Dialog from "./Dialog.svelte";
import LoginForm from "./LoginForm.svelte";
import { goto } from "$app/navigation";
import { fly } from "svelte/transition";
let isDialogOpen = false;
let isDropdownOpen = false;
async function logout() {
  goto("/");
  client.authStore.clear();
  isDialogOpen = false;
  isDropdownOpen = false;

  // Ensure dropdown is closed on logout
}

function getFileUrl(authModel: { id: any; }, avatar: any) {
  const baseUrl =
    import.meta.env.VITE_APP_BASE_URL + "/api/files/_pb_users_auth_";
  const userId = authModel.id;
  const fileName = avatar;
  const token = client.authStore.token;
  return `${baseUrl}/${userId}/${fileName}?token=${token}`;
}
const unsubscribe = client.authStore.onChange((token, model) => {
  // Handle auth state changes
}, false);
onDestroy(() => {
  unsubscribe();
});
</script>

<!-- Display user information and dropdown toggle -->
{#if $authModel}
  <div class="relative inline-block text-left">
    <button
      class="dropdown"
      on:click={() => (isDropdownOpen = !isDropdownOpen)}
      aria-haspopup="true"
      aria-expanded={isDropdownOpen}
    >
      <div tabindex="0" role="button" class="btn">
        {$authModel?.name || $authModel?.username || 'User'}
        
      </div>
    </button>
    {#if isDropdownOpen}
      <ul
        transition:fly={{ y: 10, duration: 200 }}
        class="dropdown-content menu bg-base-200 rounded-box absolute right-0 z-[1] mt-2 w-52 p-2 shadow"
      >
        <li>
          <button class="justify-between" on:click={() => (isDialogOpen = true)}
            >Profile</button
          >
        </li>
        <!-- Add more dropdown items here -->
        <li>
          <button class="flex" title="View profile">
            <img alt="Profile" src="/avatar.png" class="w-8 rounded-full" />
            <div class="flex flex-col">
              <h3 class="font-bold">User name</h3>
              <span class="text-accent text-xs">username@email.com</span>
            </div>
          </button>
        </li>
        <div class="divider my-0"></div>
        <li><button>Settings</button></li>
        <li><button>Keyboard shortcut</button></li>
        <div class="divider my-0"></div>
        <li><button>Company profile</button></li>
        <li><button>Team</button></li>
        <li><button>Invite Colleagues</button></li>
        <div class="divider my-0"></div>
        <li><button>Help</button></li>
        <li><button on:click={logout}>Sign out</button></li>
      </ul>
    {/if}
  </div>
{:else}
  <button class="btn btn-primary" on:click={() => (isDialogOpen = true)}
    >Sign In</button
  >
{/if}
<Dialog bind:open={isDialogOpen}>
  {#if $authModel}
    <!-- Logged in user's profile or logout option -->
    <div transition:fly={{ y: -10, duration: 200 }}>
      <button on:click={logout}>Sign Out</button>
    </div>
  {:else}
    <!-- Login form for users who are not logged in -->
    <div transition:fly={{ y: -10, duration: 200 }}><LoginForm /></div>
  {/if}
</Dialog>
