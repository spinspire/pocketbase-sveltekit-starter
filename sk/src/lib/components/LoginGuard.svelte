<script>
  import { authModel } from "../pocketbase";
  import LoginForm from "./LoginForm.svelte";
  export let slotLogin = false;
</script>

{#if $authModel}
  <slot />
{:else if slotLogin || $$slots["login"]}
  <slot name="login">
    <LoginForm />
  </slot>
{/if}
