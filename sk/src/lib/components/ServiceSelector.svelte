<script lang="ts">
    export let selectedService: string;
    export let selectedModel: string;
  
    import { writable } from "svelte/store";
    import { availableServices } from "$lib/utils/api";
  </script>
  
  <div class="flex bg-primary items-center ">
    <select
      class="select select-ghost w-full max-w-xs"
      bind:value={selectedService}
    >
      {#each availableServices as service, i}
        <option value={service.name} selected={i === 0}>{service.name}</option>
      {/each}
    </select>
  
    {#if selectedService}
      <select
        class="select select-ghost w-full max-w-xs"
        bind:value={selectedModel}
      >
        {#each availableServices.find(s => s.name === selectedService)?.models ?? [] as model, i}
          <option value={model} selected={i === 0}>{model}</option>
        {/each}
      </select>
    {/if}
  </div>