<script context="module" lang="ts">
  import { writable } from "svelte/store";
  import Dialog from "./Dialog.svelte";

  function createStore() {
    const defaultValue: { [key: string]: any } = {};
    Object.entries(localStorage).forEach(([key, value]) => {
      try {
        defaultValue[key] = JSON.parse(value);
      } catch (e) {
        // If parsing fails, keep the value as a string
        defaultValue[key] = value;
      }
    });
    const { subscribe, update } = writable<{ [key: string]: any }>(
      defaultValue
    );
    return {
      subscribe,
      remove(key: string) {
        localStorage.removeItem(key);
        update((current) => {
          const newStore = { ...current };
          delete newStore[key];
          return newStore;
        });
      },
      setItem(key: string, value: any) {
        if (value === undefined) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }
        update((current) => {
          return { ...current, [key]: value };
        });
      },
    };
  }

  export const ls = createStore();
</script>

<table>
  <tbody>
    {#each Object.entries($ls) as [key, value]}
      {@const valueString = JSON.stringify(value, null, 2)}
      <tr>
        <th>{key}</th>
        <td>
          <Dialog>
            {#snippet trigger(open)}
              <button
                type="button"
                onclick={open}
                class="small"
                aria-label="View value"
              >
                Show
              </button>
            {/snippet}
            <pre>{valueString}</pre>
          </Dialog>
        </td>
        <td title={valueString}>
          {valueString}
        </td>
        <td>
          <button
            type="button"
            onclick={() => ls.remove(key)}
            class="small round"
            aria-label="Remove"
          >
            &times;
          </button>
        </td>
      </tr>
    {:else}
      <tr><td colspan="999">No entries in localStorage</td></tr>
    {/each}
  </tbody>
</table>

<style lang="scss">
  table {
    td {
      max-width: 40rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
