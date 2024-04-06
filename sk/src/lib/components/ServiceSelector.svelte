<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { availableServices } from "$lib/utils/api";

  export let selectedService: string = availableServices[0]?.name ?? '';
  export let selectedModel: string = availableServices[0]?.models[0] ?? '';

  const dispatch = createEventDispatcher();

  // Set default values on mount if not provided
  onMount(() => {
    if (!selectedService) {
      selectedService = availableServices[0].name;
      dispatch("serviceChange", selectedService);
    }
    if (!selectedModel) {
      selectedModel = availableServices.find(s => s.name === selectedService)?.models[0] ?? '';
      dispatch("modelChange", selectedModel);
    }
  });

  function handleServiceChange() {
    dispatch("serviceChange", selectedService);
    selectedModel = availableServices.find(s => s.name === selectedService)?.models[0] ?? '';
    dispatch("modelChange", selectedModel);
  }

  function handleModelChange() {
    dispatch("modelChange", selectedModel);
  }
</script>

<div class="flex bg-primary items-center text-base-content">
  <select class="select select-ghost w-full max-w-xs" bind:value={selectedService} on:change={handleServiceChange}>
    {#each availableServices as service}
      <option value={service.name}>{service.name}</option>
    {/each}
  </select>
  {#if selectedService}
    <select class="select select-ghost w-full max-w-xs" bind:value={selectedModel} on:change={handleModelChange}>
      {#each availableServices.find(s => s.name === selectedService)?.models ?? [] as model}
        <option value={model}>{model}</option>
      {/each}
    </select>
  {/if}
</div>