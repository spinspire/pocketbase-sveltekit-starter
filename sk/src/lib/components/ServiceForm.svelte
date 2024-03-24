<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    const dispatch = createEventDispatcher();
    let selectedService = '';
    let selectedModel = '';
    let inputText = '';
  
    const services = [
      {
        name: "Anthropic",
        models: [
          "claude-3-haiku-20240307",
          "claude-3-sonnet-20240229",
          "claude-3-opus-20240229",
          "claude-2.1",
          "claude-2.0",
          "claude-instant-1.2",
        ],
      },
      {
        name: "OpenAI",
        models: ["gpt-4-turbo-preview", "gpt-3.5-turbo"],
      },
    ];
  
    async function callAPI() {
      // Emit an event with the selected service, model, and input text
      dispatch('submit', { selectedService, selectedModel, inputText });
    }
  </script>
  
  <div>
    <select bind:value={selectedService}>
      <option value="">Select a service</option>
      {#each services as service}
        <option value={service.name}>{service.name}</option>
      {/each}
    </select>
  
    {#if selectedService}
      <select bind:value={selectedModel}>
        <option value="">Select a model</option>
        {#each services.find(s => s.name === selectedService)?.models ?? [] as model}
          <option value={model}>{model}</option>
        {/each}
      </select>
    {/if}
  
    <input type="text" bind:value={inputText} placeholder="Enter text" />
    <button on:click={callAPI} disabled={!selectedService || !selectedModel}>
      Submit
    </button>
  </div>