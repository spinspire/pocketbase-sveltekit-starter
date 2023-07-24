<script lang="ts">
  import { goto } from "$app/navigation";
  import { Admin } from "pocketbase";
  import { authModel } from "../pocketbase";
  import LoginForm from "./LoginForm.svelte";
  export let admin: boolean | undefined = undefined;
  export let slotLogin = false;
  export let destination: string | null = null;
  $: if (destination != null && $authModel) {
    goto(destination);
  }
  $: authorized =
    $authModel && //  must be logged in
    (admin === undefined || // admin or not, doesn't matter
      (admin === true && $authModel instanceof Admin) || // must be admin
      (admin === false && !($authModel instanceof Admin))); // must not be admin
</script>

{#if authorized}
  <slot />
{:else if slotLogin || $$slots["login"]}
  <slot name="login">
    <LoginForm />
  </slot>
{/if}
