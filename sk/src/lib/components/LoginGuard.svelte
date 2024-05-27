<script lang="ts">
  import { goto } from "$app/navigation";
  import { authModel, client } from "$lib/pocketbase";
  import type { Snippet } from "svelte";
  import type { BaseAuthStore } from "pocketbase";
  const {
    admin,
    destination,
    otherwise,
    children,
  }: {
    admin?: boolean;
    destination?: string;
    otherwise?: Snippet<[]>;
    children: Snippet<[]>;
  } = $props();
  $effect(() => {
    if (!!destination && client.authStore.isValid) {
      // navigate to destination if specified, and logged in
      goto(destination);
    }
  });
  const authorized = $derived(
    $authModel && //  must be logged in
      // if admin is specified -- must be admin if admin true, must not be admin if admin false
      (admin === undefined || admin === client.authStore.isAdmin)
  );
</script>

{#if authorized}
  {@render children()}
{:else if otherwise}
  {@render otherwise()}
{/if}
