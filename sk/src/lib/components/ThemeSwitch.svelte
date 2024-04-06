<script>
import { onMount } from "svelte";
import { themes } from "$lib/utils/themes";

let currentTheme = "light";
/**
 * @type {HTMLDialogElement}
 */
let modal;

/**
 * @param {string} themeId
 */
function changeTheme(themeId) {
  const theme = themes.find((t) => t.id === themeId);
  if (theme) {
    document.documentElement.setAttribute("data-theme", theme.id);
    currentTheme = theme.id;
    localStorage.setItem("theme", theme.id);
    modal.close();
  }
}

onMount(() => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme && themes.some((t) => t.id === savedTheme)) {
    changeTheme(savedTheme);
  }
});
</script>

<button
  type="button"
  on:click={() => modal.showModal()}
  aria-label="Open Theme Modal">Theme</button
>

<dialog bind:this={modal} class="modal" id="modal">
  <div class="modal-box w-11/12 max-w-5xl">
    <h3 class="text-lg font-bold">Select a Theme</h3>
    <div class="grid grid-cols-1 gap-4 py-4 md:grid-cols-2 lg:grid-cols-3">
      {#each themes as theme (theme.id)}
        <button
          class="border-base-content/20 hover:border-base-content/40 cursor-pointer overflow-hidden rounded-lg border outline outline-2 outline-offset-2 outline-transparent"
          data-set-theme={theme.id}
          data-act-class="!outline-base-content"
          on:click={() => changeTheme(theme.id)}
        >
          <div
            data-theme={theme.id}
            class="bg-base-100 text-base-content w-full font-sans"
          >
            <div class="grid grid-cols-5 grid-rows-3">
              <div class="bg-base-200 col-start-1 row-span-2 row-start-1"></div>
              <div class="bg-base-300 col-start-1 row-start-3"></div>
              <div
                class="bg-base-100 col-span-4 col-start-2 row-span-3 row-start-1 flex flex-col gap-1 p-2"
              >
                <div class="font-bold">{theme.name}</div>
                <div class="flex flex-wrap gap-1">
                  <div
                    class="bg-primary flex aspect-square w-5 items-center justify-center rounded lg:w-6"
                  >
                    <div class="text-primary-content text-sm font-bold">A</div>
                  </div>
                  <div
                    class="bg-secondary flex aspect-square w-5 items-center justify-center rounded lg:w-6"
                  >
                    <div class="text-secondary-content text-sm font-bold">
                      A
                    </div>
                  </div>
                  <div
                    class="bg-accent flex aspect-square w-5 items-center justify-center rounded lg:w-6"
                  >
                    <div class="text-accent-content text-sm font-bold">A</div>
                  </div>
                  <div
                    class="bg-neutral flex aspect-square w-5 items-center justify-center rounded lg:w-6"
                  >
                    <div class="text-neutral-content text-sm font-bold">A</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </button>
      {/each}
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>Close</button>
  </form>
</dialog>
