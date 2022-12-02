<script lang="ts">
  import { goto } from "$app/navigation";
  import { client } from "$lib/pocketbase";

  export let id: string;
  export let table: string;
  async function submit() {
    await client.collection(table).delete(id);
    goto("..");
  }
</script>

<form on:submit|preventDefault={submit}>
  <article>
    <aside>Are you sure you want to delete the following record?</aside>
  </article>
  <button type="submit">Yes - Proceed</button>
  <button type="reset" on:click={() => goto("..")}>No - Cancel</button>
</form>
