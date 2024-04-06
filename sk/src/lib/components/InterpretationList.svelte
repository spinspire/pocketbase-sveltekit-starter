<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { scale } from 'svelte/transition';

  export let interpretations: { title: string; text: string; imageUrl: string }[];

  const dispatch = createEventDispatcher();

  function selectInterpretation(interpretation: { title: string; text: string; imageUrl: string }) {
    dispatch("select", { interpretation });
  }

  function goBack() {
    dispatch("back");
  }
</script>

<style>
  .interpretation:hover {
    transform: translateY(-5px);
    transition: transform 0.3s ease;
  }
</style>

<div class="container mx-auto p-4">
  <div class="mb-6">
    <h2 class="text-2xl font-semibold mb-4 text-center">Select an interpretation:</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each interpretations as interpretation (interpretation.title)}
        <button class="max-w-sm rounded overflow-hidden shadow-lg cursor-pointer interpretation bg-primary text-primary-content hover:bg-secondary transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105" 
                on:click={() => selectInterpretation(interpretation)} 
                in:scale={{ duration: 300 }}>
          <img class="w-full" src={interpretation.imageUrl} alt={`Image for ${interpretation.title}`} in:scale={{ duration: 300 }}>
          <div class="px-6 py-4">
            <div class="font-bold text-xl mb-2 text-primary-content">{interpretation.title}</div>
            <p class="text-primary-content ">
              {interpretation.text}
            </p>
          </div>
        </button>
      {/each}
    </div>
  </div>
  <button class="btn btn-primary" on:click={goBack}>Back</button>
</div>
