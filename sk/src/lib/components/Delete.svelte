<script lang="ts">
  import { goto } from "$app/navigation";
  import { client } from "$lib/pocketbase";
  import { alertOnFailure } from "$lib/pocketbase/ui";

  const {
    id,
    table,
    return_path = "back",
  }: { id: string; table: string; return_path?: string } = $props();
  async function back() {
    if (return_path === "back") {
      history.back();
    } else {
      await goto(return_path);
    }
  }
  async function submit(e: SubmitEvent) {
    e.preventDefault();
    alertOnFailure(async () => {
      await client.collection(table).delete(id);
      await back();
    });
  }
</script>

<form onsubmit={submit}>
  <article>
    <aside>Are you sure you want to delete the following record?</aside>
  </article>
  <button type="submit">Yes - Proceed</button>
  <button type="reset" onclick={back}>No - Cancel</button>
</form>
