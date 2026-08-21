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
    <header>
      <h3>Confirm Delete</h3>
    </header>
    <div>
      <p>Are you sure you want to delete this record?</p>
    </div>
    <footer>
      <div role="group">
        <button type="submit">
          <i class="bi bi-trash"></i> Yes - Delete
        </button>
        <button type="reset" class="outline" onclick={back}>
          <i class="bi bi-x-lg"></i> No - Cancel
        </button>
      </div>
    </footer>
  </article>
</form>
